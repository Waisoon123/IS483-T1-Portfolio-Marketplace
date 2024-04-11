function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getInitials(name) {
  const tokens = name.split(' ');
  let initials = tokens[0].substring(0, 1);

  if (tokens.length > 1) {
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.charAt(0) === '(') {
      initials += lastToken.charAt(1);
    } else {
      initials += lastToken.charAt(0);
    }
  }

  return initials;
}

export default function companyPlaceholderImage(name) {
  const color = getRandomColor();
  return `https://dummyimage.com/150x150/${color}/ffffff?text=${getInitials(name)}`;
}
