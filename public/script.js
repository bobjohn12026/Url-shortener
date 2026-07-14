const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const errorElement = document.getElementById('error');
const resultSection = document.getElementById('resultSection');
const loadingSpinner = document.getElementById('loadingSpinner');

let currentShortUrl = '';

shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    showLoading(true);
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to shorten URL');
    }

    const data = await response.json();
    displayResult(data);
  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
  }
});

function displayResult(data) {
  document.getElementById('originalUrl').textContent = data.originalUrl;
  document.getElementById('shortCode').textContent = data.shortCode;
  currentShortUrl = data.shortUrl;
  document.getElementById('shortUrl').value = data.shortUrl;
  resultSection.classList.remove('hidden');
  urlInput.value = '';
  urlInput.focus();
}

function copyToClipboard() {
  const shortUrlInput = document.getElementById('shortUrl');
  const copyMessage = document.getElementById('copyMessage');

  shortUrlInput.select();
  document.execCommand('copy');

  copyMessage.textContent = '✓ Copied to clipboard!';
  copyMessage.classList.add('show');

  setTimeout(() => {
    copyMessage.classList.remove('show');
  }, 2000);
}

function resetForm() {
  resultSection.classList.add('hidden');
  document.getElementById('copyMessage').textContent = '';
  document.getElementById('copyMessage').classList.remove('show');
  urlInput.focus();
}

function showError(message) {
  errorElement.textContent = message;
}

function clearError() {
  errorElement.textContent = '';
}

function showLoading(isLoading) {
  loadingSpinner.classList.toggle('hidden', !isLoading);
}
