import os
from haystack.document_stores import FAISSDocumentStore
from haystack.schema import Document
from haystack.nodes import EmbeddingRetriever, PreProcessor, SentenceTransformersRanker
from haystack.pipelines import Pipeline
from os import getenv
from dotenv import load_dotenv

NUM_OF_RESULTS_TO_RETURN = 6
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PORTFOLIO_COMPANIES_FILE_NAME = "portfolio_companies_raw_data.csv"
PORTFOLIO_COMPANIES_FILE_PATH = os.path.join(CURRENT_DIR, "assets", PORTFOLIO_COMPANIES_FILE_NAME)
FIASS_LOAD_FILE_NAME = "semantic_search"
FIASS_LOAD_FILE_PATH = os.path.join(CURRENT_DIR, FIASS_LOAD_FILE_NAME + ".fiass")
SQLITE_DB_FILE_PATH = os.path.join(CURRENT_DIR, FIASS_LOAD_FILE_NAME + ".sqlite")


def train_search_model():
    import pandas as pd
    # Load the portfolio companies data. [COMPANY, DESCRIPTION, TAGS, TECH SECTORS, HQ/Main Office, VERTEX ENTITY, FINANCE STAGE, HOLDING STATUS, WEBSITE]
    raw_df = pd.read_csv(PORTFOLIO_COMPANIES_FILE_PATH)
    # Select only the relevant columns.
    df = raw_df[["COMPANY", "DESCRIPTION", "TECH SECTORS"]]

    # Create a new FAISSDocumentStore or load the existing one if it exists.
    if os.path.exists(FIASS_LOAD_FILE_PATH):
        document_store = FAISSDocumentStore.load(FIASS_LOAD_FILE_PATH)
    else:
        load_dotenv()
        user = getenv('DB_USER')
        password = getenv('DB_PASSWORD')
        host = getenv('DB_HOST')
        port = getenv('DB_PORT')
        sql_url = f"postgresql://{user}:{password}@{host}:{port}/postgres"
        document_store = FAISSDocumentStore(sql_url=sql_url, faiss_index_factory_str="Flat", embedding_dim=384)

    documents = []
    for index, doc in df.iterrows():
        documents.append(
            Document(
                content=str(doc["COMPANY"]) + " " + str(doc["DESCRIPTION"]) + " " + str(doc["TECH SECTORS"]),
                meta={"title": str(doc["COMPANY"]), "abstract": str(
                    doc["DESCRIPTION"]), "sector": str(doc["TECH SECTORS"])},
            )
        )

    preprocessor = PreProcessor(
        clean_empty_lines=True,
        clean_whitespace=True,
        clean_header_footer=True,
        split_by="word",
        split_length=512,
        split_overlap=32,
        split_respect_sentence_boundary=True,
    )
    docs_to_index = preprocessor.process(documents)

    dense_retriever = EmbeddingRetriever(
        document_store=document_store,
        embedding_model="sentence-transformers/all-MiniLM-L6-v2",
        use_gpu=True,
        scale_score=False,
    )

    document_store.delete_documents()
    document_store.write_documents(docs_to_index)
    document_store.update_embeddings(retriever=dense_retriever)
    document_store.save(FIASS_LOAD_FILE_PATH)


def search_model(query):
    if query is None or query == "":
        return None

    if os.path.exists(FIASS_LOAD_FILE_PATH):
        document_store = FAISSDocumentStore.load(FIASS_LOAD_FILE_PATH)
    else:
        return "No search model found. Please train the search model first."

    dense_retriever = EmbeddingRetriever(
        document_store=document_store,
        embedding_model="sentence-transformers/all-MiniLM-L6-v2",
        use_gpu=True,
        scale_score=False,
    )

    rerank = SentenceTransformersRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-6-v2")

    pipeline = Pipeline()
    pipeline.add_node(component=dense_retriever, name="DenseRetriever", inputs=["Query"])
    pipeline.add_node(component=rerank, name="ReRanker", inputs=["DenseRetriever"])

    prediction = pipeline.run(
        query=query,
        params={
            "DenseRetriever": {"top_k": 10},
            "ReRanker": {"top_k": NUM_OF_RESULTS_TO_RETURN},
        },
    )
    return get_title_results(prediction)  # Uncomment this line to return only the titles. (Production purposes)
    # return prediction  # Uncomment this line to return the full prediction. (Debugging purposes)


def pretty_print_results(prediction):
    for doc in prediction["documents"]:
        print(doc.meta["title"], "\t", doc.score)
        print(doc.meta["abstract"])
        print("\n", "\n")


def get_title_results(prediction):
    titles = []
    for doc in prediction["documents"]:
        titles.append(doc.meta["title"])
    return titles


def main():
    query = "AI and machine learning company in the healthcare sector."  # Static query for debugging purposes.
    prediction = search_model(query)
    if type(prediction) == list:
        print(prediction)
    else:
        # Pretty Print only when search_model returns the full prediction instead of just the titles.
        pretty_print_results(prediction)


if __name__ == "__main__":
    # train_search_model()  # Uncomment this line to (re)train the search model.
    main()
