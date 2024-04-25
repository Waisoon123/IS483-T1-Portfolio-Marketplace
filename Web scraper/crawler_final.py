import os
import re
import csv
import time
import html
import torch
import random
import logging
import requests
import argparse
import unicodedata
import pandas as pd

from bs4 import BeautifulSoup
from transformers import pipeline
from selenium.webdriver import Chrome
from urllib.parse import urljoin, urlparse
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from haystack.nodes.retriever.web import WebRetriever
from selenium.common.exceptions import WebDriverException
from sentence_transformers import SentenceTransformer, util
from haystack.nodes.ranker.diversity import DiversityRanker
from haystack import Pipeline, Document, BaseComponent, MultiLabel
from typing import List, Optional, Union, Callable, Tuple, Dict, Any
from haystack.nodes.ranker.lost_in_the_middle import LostInTheMiddleRanker
from haystack.nodes import PromptNode, PromptTemplate, TopPSampler, PreProcessor
from requests.exceptions import MissingSchema, ConnectionError, ChunkedEncodingError, RequestException


#crawler code
class Document_custom:
    def __init__(self, url: str, text: str, social_media: Optional[Dict[str, str]] = None, sub_urls: Optional[Dict[str, str]] = None, email: Optional[str] = None):
        self.content = text
        self.score = None
        self.content_type = "text"
        self.meta = {"url": url, "id_hash_keys": ["content"], "embedding": None, "id": ""}
        self.social_media = social_media if social_media is not None else {}
        self.sub_urls = sub_urls if sub_urls is not None else {}
        self.email = email

    @property
    def id(self):
        return self.meta.get("id")

def parse_company_info(company_name: str, website: str, description: str) -> Dict[str, Tuple[str, str]]:
    # Construct company info dictionary
    company_info = {company_name: (website, description)}
    return company_info


class Crawler:
    def __init__(self,
                 crawler_depth: int = 5,
                 filter_urls: Optional[List] = None,
                 id_hash_keys: Optional[List[str]] = None,
                 extract_hidden_text: bool = True,
                 loading_wait_time: Optional[int] = None,
                 output_dir: Union[str, os.PathLike, None] = None,
                 overwrite_existing_files: bool = True,
                 file_path_meta_field_name: Optional[str] = None,
                 crawler_naming_function: Optional[Callable[[str, str], str]] = None,
                 webdriver_options: Optional[List[str]] = None,
                 webdriver: Optional[Chrome] = None):
        self.crawler_depth = crawler_depth
        self.filter_urls = filter_urls
        self.id_hash_keys = id_hash_keys
        self.extract_hidden_text = extract_hidden_text
        self.loading_wait_time = loading_wait_time
        self.output_dir = output_dir
        self.overwrite_existing_files = overwrite_existing_files
        self.file_path_meta_field_name = file_path_meta_field_name
        self.crawler_naming_function = crawler_naming_function
        self.webdriver_options = webdriver_options
        self.webdriver = webdriver

        self.init_webdriver()
        self.crawled_urls = []

    def init_webdriver(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        try:
            self.driver = Chrome(service=Service(), options=chrome_options)
        except WebDriverException as e:
            print(f"Error initializing WebDriver: {e}")
            self.driver = None

    def __del__(self):
        if self.driver:
            self.driver.quit()

    USER_AGENT_LIST = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        # Add more User-Agent strings as needed
    ]

    def handle_request_error(self, url_to_try: str, e: Exception) -> Tuple[bool, Optional[str]]:
        if isinstance(e, (MissingSchema, ConnectionError)):
            pass
        elif isinstance(e, ChunkedEncodingError):
            print(f"ChunkedEncodingError occurred: {e}")
            pass
        elif isinstance(e, RequestException):
            print(f"Error accessing URL '{url_to_try}': {e}")
            if isinstance(e.response, requests.Response) and e.response.status_code == 403:
                print(
                    "Encountered 403 Forbidden error. Retrying with different user agent and delay.")
                retry_count = 0
                while retry_count < 3:  # Retry up to 3 times
                    # Generate a random User-Agent string
                    user_agent = random.choice(self.USER_AGENT_LIST)
                    headers = {'User-Agent': user_agent}
                    try:
                        # Retry the request with a different User-Agent
                        response = requests.get(url_to_try, headers=headers)
                        response.raise_for_status()
                        print("Request succeeded after retrying with a different User-Agent.")
                        print(" ")
                        print("This is the url being returned: ", url_to_try)
                        return True, url_to_try
                    except Exception as e:
                        retry_count += 1
                        print(f"Error accessing URL '{url_to_try}': {e}")
                        # Introduce a delay before retrying
                        time.sleep(random.uniform(3, 5))
                print("Failed to fetch HTML content even after retries. Giving up on this URL.")
            else:
                return False, None
        return False, None

    def crawl(self,
              company_info: Dict[str, Tuple[str, str]],
              crawler_depth: Optional[int] = None,
              filter_urls: Optional[List] = None,
              id_hash_keys: Optional[List[str]] = None,
              extract_hidden_text: Optional[bool] = None,
              loading_wait_time: Optional[int] = 5,
              output_dir: Union[str, os.PathLike, None] = None,
              overwrite_existing_files: Optional[bool] = None,
              file_path_meta_field_name: Optional[str] = None,
              crawler_naming_function: Optional[Callable[[str, str], str]] = None
              ) -> Tuple[str, Dict[str, str]]:
        if crawler_depth is not None:
            self.crawler_depth = crawler_depth
        if filter_urls is not None:
            self.filter_urls = filter_urls
        if id_hash_keys is not None:
            self.id_hash_keys = id_hash_keys
        if extract_hidden_text is not None:
            self.extract_hidden_text = extract_hidden_text
        if loading_wait_time is not None:
            self.loading_wait_time = loading_wait_time
        if output_dir is not None:
            self.output_dir = output_dir
        if overwrite_existing_files is not None:
            self.overwrite_existing_files = overwrite_existing_files
        if file_path_meta_field_name is not None:
            self.file_path_meta_field_name = file_path_meta_field_name
        if crawler_naming_function is not None:
            self.crawler_naming_function = crawler_naming_function

        print("Crawling started...")
        url_status = True
        best_email = ""
        unique_social_media = {}

        for company_name, (website, description) in company_info.items():
            print(f"Processing company: {company_name}")
            print(f"Website: {website}")

            # for email scraping
            domain = website
            print("this is the domain: ", domain)

            current_company_documents = []
            valid_url_found = False
            sub_urls = None

            if not website.startswith(("http://", "https://")):
                print(f"Invalid URL: {website}")
                urls_to_try = ["http://" + website, "https://" + website]
                for url_to_try in urls_to_try:
                    print(f"Trying URL: {url_to_try}")
                    try:
                        response = requests.get(url_to_try, allow_redirects=True)
                        response.raise_for_status()
                        valid_url_found = True
                        company_info[company_name] = (url_to_try, description)
                        website = response.url
                        print("Valid URL found:", website)
                        url_status = True
                        break
                    except Exception as e:
                        retry, retry_results = self.handle_request_error(url_to_try, e)

                        # If the request was successful, use the final URL as the website URL and set the valid_url_found flag to true
                        if retry:
                            valid_url_found = True
                            website = retry_results

                        if not retry:
                            print("Failed to fetch HTML content. Giving up on this URL.")
                            # Break only if both HTTP and HTTPS attempts have been made
                            if url_to_try == urls_to_try[-1]:
                                break

                            continue  # Continue to the next iteration if the current attempt fails

                print("This is to see if the break reaches here")
                print("This is the valid flag: ", valid_url_found)
                if not valid_url_found:
                    print("Entered the not valid url found block.")
                    url_status = False
                    print("Skipping company due to invalid URL.")
                    continue  # Skip to the next company if a valid URL is not found

                else:
                    print("entered the not website.startswith else block")
                    print("This is the website being scraped: ", website)
                    try:
                        html_content = self.extract_html_content_with_selenium(website)
                        text_content, social_media_links, sub_urls = self.extract_text_and_social_media(html_content, website)
                        document = Document_custom(website, text_content, social_media=social_media_links, sub_urls=sub_urls)
                        current_company_documents.append(document)
                        self.crawled_urls.append(website)
                        print("Done appending the document pt 2")
                    except Exception as e:
                        print(f"Error occurred while crawling URL: {website}\nError: {e}")
            else:
                print("entered else block")
                print("This is the website being scraped: ", website)
                try:
                    html_content = self.extract_html_content_with_selenium(website)
                    text_content, social_media_links, sub_urls = self.extract_text_and_social_media(html_content, website)
                    document = Document_custom(website, text_content, social_media=social_media_links, sub_urls=sub_urls)
                    current_company_documents.append(document)
                    self.crawled_urls.append(website)
                except Exception as e:
                    print(f"Error occurred while crawling URL: {website}\nError: {e}")

            print("This is the url_status: ", url_status)
            if url_status:
                updated_website = website
                if sub_urls is None:
                    print("No sub URLs found")
                else:
                    for sub_url in sub_urls.keys():
                        if sub_url == "/":
                            continue

                        # Remove trailing slashes from the website URL
                        website = website.rstrip("/")

                        # Extract the sub path from the sub_urls dictionary
                        sub_path = sub_urls[sub_url]

                        if sub_path.startswith(("http://", "https://")):
                            full_url = sub_path  # Use the sub path directly if it's a valid URL
                        else:
                            # Remove leading slashes from the sub URL
                            sub_path_cleaned = sub_path.lstrip("/")

                            print("This is the initialized updated website: ", updated_website)

                            # Check and add appropriate protocol to the website URL
                            if not website.startswith(("http://", "https://")):
                                # Try adding 'http://' and 'https://' prefixes to the website URL
                                print("entered the if not start with http for sub url.")
                                urls_to_try = ["http://" + website, "https://" + website]
                                for url_to_try in urls_to_try:
                                    try:
                                        response = requests.get(url_to_try)
                                        response.raise_for_status()  # If successful, use this as the website URL
                                        updated_website = url_to_try
                                        print("changed the website")
                                        break
                                    except Exception as e:
                                        retry, retry_results = self.handle_request_error(url_to_try, e)
                                        updated_website = retry_results
                                        if not retry:
                                            print("Failed to fetch HTML content. Giving up on this URL.")
                                            break

                                print("This is the current updated website: ", updated_website)
                                # Concatenate the website URL and sub URL with a single slash in between
                                full_url = f"{updated_website}/{sub_path_cleaned}"
                            else:
                                print("This is the current website: ", website)
                                # Concatenate the website URL and sub URL with a single slash in between
                                full_url = f"{website}/{sub_path_cleaned}"

                        print(f"Crawling sub URL: {full_url}")
                        try:
                            # Handle non-PDF URLs
                            print("entered the non pdf url block")
                            html_content = self.extract_html_content_with_selenium(full_url)
                            sub_text_content, sub_social_media_links, sub_sub_urls = self.extract_text_and_social_media(html_content, updated_website)
                            sub_document = Document_custom(full_url, sub_text_content, social_media=sub_social_media_links, sub_urls=sub_sub_urls)
                            current_company_documents.append(sub_document)
                            self.crawled_urls.append(full_url)
                        except Exception as e:
                            print(f"Error occurred while crawling sub URL: {full_url}\nError: {e}")

            # Assuming current_company_documents is a list of Document objects
            if valid_url_found:
                content = [doc.content for doc in current_company_documents]
                best_email = self.extract_emails(content, domain)

                # Extract unique social media links from the current company documents
                unique_social_media = self.extract_unique_social_media(current_company_documents)

            elif not valid_url_found:
                best_email = "Email not found"
                unique_social_media = {"No social media links found": "No social media links found"}

        return best_email, unique_social_media

    def fetch_pdf_content(self, url: str) -> Optional[bytes]:
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Error fetching PDF content from URL: {url}\nError: {e}")
            return None

    # ran after dumping ALL scraped content
    def extract_emails(self, contents: List[str], domain: str) -> str:
        # Concatenate all the content into one big block of text
        combined_content = ' '.join(contents)

        print("This are the contents: ", combined_content)

        # Parse HTML content using BeautifulSoup
        soup = BeautifulSoup(combined_content, "html.parser")
        [s.extract() for s in soup('script')]
        [s.extract() for s in soup('style')]

        # # Define a regular expression pattern to match email addresses with the specified domain
        # pattern = rf"\b[A-Za-z0-9._%+-]+@{domain}\b"

        # # Find all email addresses matching the pattern in the HTML content
        # emails = re.findall(pattern, combined_content)
        # print("These are the emails found: ", emails)

        # Define a regular expression pattern to match email addresses
        pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"

        # Find all email addresses matching the pattern in the HTML content
        emails = re.findall(pattern, combined_content)
        print("These are the emails found: ", emails)

        # Look for patterns or keywords indicating contact information
        contact_keywords = ["contact us","email us", "reach out", "get in touch"]

        if emails:
            # Find the nearest email to the contact keywords
            best_email = ""
            min_distance = float('inf')
            for keyword in contact_keywords:
                matches = re.finditer(keyword, combined_content, flags=re.IGNORECASE)
                # match = re.search(rf"\b{keyword}\b", combined_content, flags=re.IGNORECASE)
                # if match:
                #     keyword_position = match.start()
                #     for email in emails:
                #         email_position = combined_content.find(email)
                #         distance = abs(keyword_position - email_position)
                #         if distance < min_distance:
                #             min_distance = distance
                #             best_email = email
            
                for match in matches:
                    keyword_position = match.start()
                    closest_email = min(emails, key=lambda x: abs(combined_content.find(x) - keyword_position))
                    if closest_email:
                        best_email = closest_email

            print("This is the best email: ", best_email)

            # Prioritize emails containing specific keywords before the @ symbol
            prioritized_keywords = ["contact", "partner"]
            for email in emails:
                local_part = email.split('@')[0]
                print("This is the local part: ", local_part)
                for keyword in prioritized_keywords:
                    if keyword in local_part:
                        print("This is the email that contains the prioritized_keywords: ", email)
                        return email
            # Return the appropriate email based on the conditions
            if best_email:
                return best_email
        
    # Check if there are emails containing the specified domain
        if any(email.endswith(domain) for email in emails):
            return next(email for email in emails if email.endswith(domain))
        else:
            # If no emails with the specified domain, return the first email in the list
            return emails[0] if emails else ""

    def extract_html_content_with_selenium(self, url: str) -> str:
        if not self.driver:
            print("WebDriver is not initialized. Exiting...")
            return ""
        try:
            driver = self.driver
            driver.get(url)
            time.sleep(random.uniform(3, 5))
            html_content = driver.page_source
            return html_content
        except WebDriverException as e:
            print(f"Error extracting HTML content with WebDriver: {e}")
            return ""

    def extract_text_and_social_media(self, html_content: str, base_url: str) -> Tuple[str, Dict[str, str], Dict[str, str], bytes]:
        soup = BeautifulSoup(html_content, "html.parser")
        [s.extract() for s in soup('script')]
        [s.extract() for s in soup('style')]

        for tag in soup.find_all(class_=re.compile("cookie")):
            tag.extract()

        text_content = ""
        for element in soup.find_all(string=True):
            element_text = element.strip()
            element_text = html.unescape(element_text)
            element_text = unicodedata.normalize("NFKD", element_text)
            text_content += " " + element_text

        social_media_links = self.extract_social_media_links(soup)
        sub_urls = self.extract_sub_urls(soup)

        return text_content.strip(), social_media_links, sub_urls

    def extract_social_media_links(self, soup: BeautifulSoup) -> Dict[str, str]:
        social_media_links = {}
        facebook_link = soup.find("a", href=re.compile(r"facebook.com"))
        if facebook_link:
            social_media_links['facebook'] = facebook_link['href']

        twitter_link = soup.find("a", href=re.compile(r"twitter.com"))
        if twitter_link:
            social_media_links['twitter'] = twitter_link['href']

        linkedin_link = soup.find("a", href=re.compile(r"linkedin.com"))
        if linkedin_link:
            social_media_links['linkedin'] = linkedin_link['href']

        if instagram_link := soup.find("a", href=re.compile(r"instagram.com")):
            social_media_links['instagram'] = instagram_link['href']
        return social_media_links

    def extract_sub_urls(self, soup: BeautifulSoup) -> Dict[str, str]:
        sub_urls = {}
        for anchor_tag in soup.find_all('a', href=True):
            anchor_text = anchor_tag.get_text(strip=True)
            anchor_url = anchor_tag['href']
            # Filter out "#" URLs
            if not anchor_url.startswith("#"):
                sub_urls[anchor_text] = anchor_url
        return sub_urls

    def extract_unique_social_media(self, current_company_documents):
        unique_social_media = {}  # Dictionary to store unique social media links

        # Iterate over each Document object
        for doc in current_company_documents:
            social_media = doc.social_media

            # Iterate over each social media platform and link in the Document
            for platform, link in social_media.items():
                # Check if the social media platform already exists in the dictionary
                if platform not in unique_social_media:
                    # Add the social media link to the dictionary if it's not already present
                    unique_social_media[platform] = link
                else:
                    # If the platform already exists, update the link only if it's different
                    if unique_social_media[platform] != link:
                        print(f"Multiple links found for {platform}. Keeping the first one.")

        return unique_social_media
    
# pipeline code
os.environ["SERPERDEV_API_KEY"] = "" # Add your SerpDevAPI key here
os.environ["HF_API_KEY"] = "" # Add your Hugging Face API key here

# Define a function to calculate average pairwise cosine distance (as previously provided)
def average_pairwise_cosine_distance(encoder: SentenceTransformer, document: List[Document]):
    sentences = [doc.content for doc in document]
    embeddings = encoder.encode(sentences, convert_to_tensor=True)
    cos_sim_matrix = util.cos_sim(embeddings, embeddings)
    cos_dist_matrix = 1 - cos_sim_matrix
    mask = torch.triu(torch.ones_like(cos_dist_matrix, dtype=torch.bool), diagonal=1)
    avg_cosine_distance = cos_dist_matrix[mask].mean().item()
    return avg_cosine_distance

search_key = os.environ.get("SERPERDEV_API_KEY")
if not search_key:
    raise ValueError("Please set the SERPERDEV_API_KEY environment variable")

HF_key = os.environ.get("HF_API_KEY")
if not HF_key:
    raise ValueError("Please set the HF_API_KEY environment variable")

models_info: Dict[str, Any] = {
    "openai": {"api_key": os.environ.get("OPENAI_API_KEY"), "model_name": "gpt-3.5-turbo"},
    "hf": {"api_key": os.environ.get("HF_API_KEY"), "model_name": "tiiuae/falcon-7b"},
}

prompt_text = """
Synthesize a comprehensive answer from the provided paragraphs and the given question.\n
Answer in full sentences and paragraphs, don't use bullet points or lists.\n
If the answer includes multiple chronological events, order them chronologically.\n
\n\n Paragraphs: {join(documents)} \n\n Question: {query} \n\n Answer:
"""
# If the answer is repetitive, just state it once.\n

stream = False
model: Dict[str, str] = models_info["hf"]

prompt_node = PromptNode(
    model["model_name"],
    default_prompt_template=PromptTemplate(prompt_text),
    api_key=model["api_key"],
    max_length=768,
    model_kwargs={"stream": stream, 
                  "model_max_length": 2048, 
                 },
)
web_retriever = WebRetriever(
    api_key=search_key,
    top_search_results=10,
    preprocessor=PreProcessor(progress_bar=False, split_length=200),
    mode="preprocessed_documents",
    top_k=50,
)

encoder = SentenceTransformer("all-MiniLM-L6-v2")
sampler = TopPSampler(top_p=0.90)


def create_pipeline(prompt_text):
    prompt_node = PromptNode(
    model["model_name"],
    default_prompt_template=PromptTemplate(prompt_text),
    api_key=model["api_key"],
    max_length=768,
    model_kwargs={"stream": stream, 
                  "model_max_length": 2048, 
                 },
    )
    # Initialize the pipeline with its components
    opt_pipe = Pipeline()
    opt_pipe.add_node(component=web_retriever, name="Retriever", inputs=["Query"])
    opt_pipe.add_node(component=sampler, name="Sampler", inputs=["Retriever"])
    opt_pipe.add_node(component=DiversityRanker(), name="DiversityRanker", inputs=["Sampler"])
    opt_pipe.add_node(component=LostInTheMiddleRanker(word_count_threshold=1024), name="LITM", inputs=["DiversityRanker"])
    opt_pipe.add_node(component=prompt_node, name="PromptNode", inputs=["LITM"])
    return opt_pipe

logger = logging.getLogger("boilerpy3")
logger.setLevel(logging.CRITICAL)

# Load the summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Define a function to extract unique sentences (as previously provided)
def get_unique_sentences(text):
    sentences = text.split(".")
    unique_sentences = []
    seen = set()
    for sentence in sentences:
        trimmed_sentence = sentence.strip()
        if trimmed_sentence not in seen:
            seen.add(trimmed_sentence)
            unique_sentences.append(trimmed_sentence)
    unique_text = ". ".join(unique_sentences)
    return unique_text

# Define a function to get a tailored prompt based on the question
def get_prompt_for_question(question, company_name):
    prompt = """
        Provide a succinct, comprehensive summary.
        Avoid repeating information and answer in full sentences and paragraphs. 
        Use bullet points or lists only if necessary to convey the information clearly. 
        Order any events or developments chronologically. Explain any technical terms or jargon in simple language, referring to the company name or website for additional details if needed. 
        If any information is not available, indicate this clearly.
        Paragraphs: {join(documents)}
        """
    if "products or services" in question:
        prompt = f"Please provide a detailed overview of the main products and services offered by {company}, as found on their website." \
                "Avoid repeating information and answer in full sentences and paragraphs." \
                "Focus on highlighting the unique aspects and benefits of these offerings."
    elif "key customers" in question:
        prompt = f"List the main customer segments or industries that {company} serves. " \
                f"Provide specific examples of key clients, if available, and describe how {company} meets their needs. " \
                f"Detail the nature of {company}'s relationship with these clients and its importance to their overall business strategy. " \
                "Offer a concise summary, avoiding repetition, for clarity and brevity."
    elif "pricing structure" in question:
        # with or without the second line
        prompt = f"Explain the pricing structure for the products and services provided by {company_name}. " \
                "Avoid repeating information and answer in full sentences and paragraphs." \
                "Include any tiers, discounts, or subscription models that apply."
    elif "social media profile" in question:
        prompt = f"Locate and list the official social media profiles for {company} mentioned on their website, emphasizing the platforms where the company is most actively engaging with its audience." \
                "Avoid repeating information and answer in full sentences and paragraphs."
    elif "founders" in question:
        prompt = f"Who are the founders of {company}, as stated on their website?" \
                "Avoid repeating information and answer in full sentences and paragraphs." \
                "Provide brief biographies and describe their vision for founding the company."
    elif "email" in question:
        prompt = f"What is the official contact email for {company} provided on their website?" \
                "Avoid repeating information and answer in full sentences and paragraphs." \
                "Specify the purpose of this email address, such as general inquiries, customer support, etc."
    else:
        prompt = f"Provide a comprehensive answer to the following question about {company_name}: {question}"

    return prompt

#def run_pipeline(company_name: str, question_list, pipe: Pipeline = None):
def run_pipeline(company_name: str, question_list):
    final_list = []
    total_cosine_distance = 0
    cosine_distance_list = []

    for question in question_list:
        print(f"\nQuestion: {question}")
        # Generate a tailored prompt for the current question
        prompt_text = get_prompt_for_question(question, company_name)
        #############################################################
        # Create a new pipeline with the updated prompt
        print("==========================================================================================================================================")
        print("PROMPT:", prompt_text)
        print("==========================================================================================================================================")
        pipe = create_pipeline(prompt_text)
        answer = pipe.run(query=question)
        # answer is a dictionary
        # dict_keys(['results', 'invocation_context', 'documents', 'root_node', 'params', 'query', 'node_id'])
        
        avg_cosine_distance = average_pairwise_cosine_distance(encoder, answer["documents"])
        total_cosine_distance += avg_cosine_distance
        
        content_length = len(answer['results'])
        dynamic_max_length = max(30, int(content_length * 0.75))  # Example: 40% of the content length
        dynamic_min_length = max(25, int(content_length * 0.4))  # Example: 20% of the content length

        # Ensure dynamic_max_length does not exceed the model's max length capability
        dynamic_max_length = min(dynamic_max_length, 130)
        dynamic_min_length = min(dynamic_min_length, dynamic_max_length)  # Ensure min_length is not greater than max_length


        # # cleaning answer['results']
        cleaned_answer = summarizer(answer['results'], max_length=dynamic_max_length, min_length=dynamic_min_length, do_sample=False)
        answer['results'] = cleaned_answer[0]['summary_text']

        if not stream:
            pass
            #print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
            #print(answer["results"])
            #print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
            #print(f"Answer: {answer}")

        final_list.append(answer)
        cosine_distance_list.append(avg_cosine_distance)
        
    print(f"\nAverage pairwise cosine distance: {total_cosine_distance / len(question_list)}")
    #for question, avg_cosine_distance in zip(question_list, cosine_distance_list):
    #    print(f"Question: {question}, average pairwise cosine distance: {avg_cosine_distance}")

    return final_list


# Placeholder for actual processing logic.
def function_A(company, website, description, tech_sector, hq_main_office, vertex_entity, finance_stage, status, id):
    question_list = [
        f"What are the main products or services offered by the company {company} with website {website}?",
        f"Who are the key customers or clients currently engaged with products from the company {company} with website {website}?",
        f"What is the pricing structure for products and services from the company {company} with website {website}?",
        #f"Could you provide official social media profile links to the company {company} with website {website}?", # use haystack crawler
        f"Who are the founders of the company {company} with website {website}?",
        #f"What is the email of the company {company}"
        ]
    print(f"\nRunning optimized pipeline with {model['model_name']}\n")
    #final = run_pipeline(company, question_list, opt_pipe)
    #final = run_pipeline(company, question_list)
    try:
        final = run_pipeline(company, question_list)
        print("This is the final: ", final)

    except Exception as e:  # Consider specifying the exact exceptions you expect, e.g., TimeoutError
        print(f"Error processing {company}: {e}")
        data = {
            'id': [id],  # Company name column
            'company': [company],
            'description': [description],
            'tech_sector': [tech_sector],  # Placeholder for tech_sector
            'hq_main_office': [hq_main_office],  # Placeholder for hq_main_office
            'vertex_entity': [vertex_entity],  # Placeholder for vertex_entity
            'finance_stage': [finance_stage],  # Placeholder for finance_stage
            'status': [status],  # Placeholder for status
            'website': [website],
            'products': [""],
            'customer_partners': [""],
            'pricings': [""],
            'founders': [""],
            'email': [""],  # Placeholder for email
            'facebook': [""],  # Placeholder for facebook
            'twitter': [""],  # Placeholder for twitter
            'linkedin': [""],  # Placeholder for linkedin
            'instagram': [""],  # Placeholder for instagram
        }
        return pd.DataFrame(data)  # Return an empty DataFrame or handle as appropriate

    
    # RUNNING cralwer to extract the social media links and emails 
    company_info = parse_company_info(company, website, final[0]['invocation_context']['results'])
    crawler = Crawler(output_dir="scraped_files", overwrite_existing_files=False)
    print(company_info)
    best_email, social_media_links = crawler.crawl(company_info)
    print("Crawling completed!")

    print("This is the best email: ", best_email)
    print("These are the social media links: ", social_media_links)

    # Construct a dictionary where keys are column names and values are the corresponding data
    data = {
        'id': [id],  # Company name column
        'company': [company],
        'description': [description],
        'tech_sector': [tech_sector],  # Placeholder for tech_sector
        'hq_main_office': [hq_main_office],  # Placeholder for hq_main_office
        'vertex_entity': [vertex_entity],  # Placeholder for vertex_entity
        'finance_stage': [finance_stage],  # Placeholder for finance_stage
        'status': [status],  # Placeholder for status
        'website': [website],
        'products': final[0]['results'],
        'customer_partners': final[1]['results'],
        'pricings': final[2]['results'],
        'founders': final[3]['results'],
        'email': [best_email],  # Placeholder for email
        'facebook': [""],  # Placeholder for facebook
        'twitter': [""],  # Placeholder for twitter
        'linkedin': [""],  # Placeholder for linkedin
        'instagram': [""],  # Placeholder for instagram
    }
    
    # Update data dictionary with social media links
    for platform, link in social_media_links.items():
        if platform == "facebook":
            data['facebook'] = link
        elif platform == "twitter":
            data['twitter'] = link
        elif platform == "linkedin":
            data['linkedin'] = link
        elif platform == "instagram":
            data['instagram'] = link
    
    # Convert the dictionary to a DataFrame
    df = pd.DataFrame(data)
    return df

def handle_output_csv(company, website, csv_path, description, tech_sector, hq_main_office, vertex_entity, finance_stage, status, id):
    # Run function_A to get its output DataFrame
    df_output = function_A(company, website, description, tech_sector, hq_main_office, vertex_entity, finance_stage, status, id)
    
    # Check if the CSV file exists
    if not os.path.exists(csv_path):
        # If the file does not exist, write the DataFrame to a new CSV file
        df_output.to_csv(csv_path, index=False)
        print(f"Created new file and wrote data for {company} to {csv_path}")
    else:
        # If the file exists, append new data without writing the header again
        df_output.to_csv(csv_path, mode='a', header=False, index=False)
        print(f"Appended data for {company} to {csv_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a file.")
    parser.add_argument('file_path', type=str, help='The path to the file to be processed')

    args = parser.parse_args()

    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(args.file_path)

    for index, row in df.iterrows():
        company = row["company"]
        website = row["website"]
        description = row["description"]
        tech_sector = row["tech_sector"]
        hq_main_office = row["hq_main_office"]
        vertex_entity = row["vertex_entity"]
        finance_stage = row["finance_stage"]
        status = row["status"]
        id = row["id"]
        handle_output_csv(company, website, './webscraped_data.csv', description, tech_sector, hq_main_office, vertex_entity, finance_stage, status, id)

    print("Everything has been completed successfully!")


