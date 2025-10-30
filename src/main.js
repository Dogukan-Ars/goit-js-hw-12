import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');
const loadMoreBtn = document.querySelector('.load-more');
const endMessage = document.querySelector('.end-message');

let lightbox;

// Pixabay API bilgileri
const API_KEY = '53016082-e520ad17d921b98237d23020b';
const BASE_URL = 'https://pixabay.com/api/';

let currentQuery = '';
let currentPage = 1;
const perPage = 40;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  currentQuery = query;
  currentPage = 1;
  gallery.innerHTML = '';
  endMessage.classList.add('hidden');
  loadMoreBtn.classList.add('hidden');

  await fetchImages();
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await fetchImages(true);
});

async function fetchImages(isLoadMore = false) {
  loader.classList.remove('hidden');

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });

    const data = response.data;
    loader.classList.add('hidden');

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'No Results',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      loadMoreBtn.classList.add('hidden');
      return;
    }

    totalHits = data.totalHits;

    renderGallery(data.hits, isLoadMore);
    handleLoadMoreButton(data.hits.length);
    smoothScroll(isLoadMore);
  } catch (error) {
    loader.classList.add('hidden');
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
    console.error(error);
  }
}

function renderGallery(images, append = false) {
  const markup = images
    .map(
      img => `
    <a class="card" href="${img.largeImageURL}">
      <img src="${img.webformatURL}" alt="${img.tags}" />
      <div class="card-info">
        <p>Likes: ${img.likes} | Views: ${img.views}</p>
        <p>Comments: ${img.comments} | Downloads: ${img.downloads}</p>
      </div>
    </a>
  `
    )
    .join('');

  if (append) {
    gallery.insertAdjacentHTML('beforeend', markup);
  } else {
    gallery.innerHTML = markup;
  }

  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
}

function handleLoadMoreButton(lastBatchCount) {
  const totalLoaded = currentPage * perPage;

  if (totalLoaded >= totalHits || lastBatchCount < perPage) {
    loadMoreBtn.classList.add('hidden');
    endMessage.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.remove('hidden');
  }
}

function smoothScroll(isLoadMore) {
  if (!isLoadMore) return;

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
