import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

// Номер сторінки пагінації
let page = 0;

// Текст для пошуку
let searchText = "";

// Галерея
let gallery;
    
const refs = {
    searchForm: document.querySelector('#search-form'),
    searchQuery: document.querySelector('.search-text'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),
}
 
// Додаємо прослуховувач на подію submit при пошуку
refs.searchForm.addEventListener('submit', onSearchFormSubmit);

// Додаємо прослуховувач на подію click при пагінації
refs.loadMore.addEventListener('click', onLoadMoreClick);

// Функція обробки події submit при пошуку
function onSearchFormSubmit(e) {
    // Забороняємо перезавантаження сторінки
    e.preventDefault();

    // Номер сторінки пагінації
    page = 1;

    // Приховуємо кпонку пагінації
    refs.loadMore.classList.remove('visible');

    // Текст для пошуку
    searchText = e.target.elements.searchQuery.value;

    // Отримання і виведення зображень
    getAndOutputImages(searchText);
}

// Функція обробки події click при пагінації
async function onLoadMoreClick(e) {
     try {
        // Отримання зображень
        const {totalHits:totalImages, hits:images} = await getImages(searchText);

        // Виведення зображень
        outputImages(images);
    } catch(error) {
        console.log(error.message);
    }
}
  
// Функція отримання і виведення зображень
async function getAndOutputImages(searchText) {
    try {
        // Отримання зображень
        const {totalHits:totalImages, hits:images} = await getImages(searchText);

        // Якщо не знайдено жодного зображення
        if (totalImages === 0) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");

            return;
        }

        // Виводимо кількість знайдених зображень
        Notiflix.Notify.success(`Hooray! We found ${totalImages}  images`);

        // Виведення зображень
        outputImages(images);
    } catch(error) {
        console.log(error.message);
    }
}

// Функція отримання зображень 
async function getImages(searchText) {
    const options = {
        params: {
            key: "34577809-7101597b9962251251dc5571b",
            q: searchText,
            image_type: "photo",
            orientation: "horizontal",
            safesearch: true,
            page: page,
            per_page: 40,
        }
    }

    const response = await axios.get('https://pixabay.com/api/', options);

    return response.data;
}

// Функція виведення зображень
function outputImages(images) {
    // Отримуємо картки зображень
    const imageCards = images.map(item => {
        // Отримуємо одну картка зображення
        return getImageCard(item);
    }).join('');

    // Якщо це перша сторінка пагінації
    if (page === 1) {
        // Додаємо картки зображень в галерею
        refs.gallery.innerHTML = imageCards;

        // Підключення галереї зображень
        initialGallery();

        // Виводимо кпонку пагінації
        refs.loadMore.classList.add('visible');
    } else {
        // Якщо більше не знайдено зображень
        if (!imageCards) {
            Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
            return;
        }

        // Додаємо картки зображень в галерею
        refs.gallery.insertAdjacentHTML('beforeend', imageCards);

        // Повторна ініціалізація галереї після додавання нових карток
        gallery.refresh();

        // Плавний скрол
        slowlyScroll();
    }
    
    // Збільшуємо номер сторінки пагінації
    page += 1;
}

// Функція отримання однієї картки зображення
function getImageCard(item) {
    const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = item;

    return `
        <a href="${largeImageURL}" class="link">
            <div class="photo-card">
                <img class="img" src="${webformatURL}" alt="${tags}" loading="lazy" width="320" />
                <div class="info">
                    <p class="info-item">
                        <b>Likes:</b>
                        ${likes}
                    </p>
                    <p class="info-item">
                        <b>Views:</b>
                        ${views}
                    </p>
                    <p class="info-item">
                        <b>Comments:</b>
                        ${comments}
                    </p>
                    <p class="info-item">
                        <b>Downloads:</b>
                        ${downloads}
                    </p>
                </div>
            </div>
        </a>
    `;
}
    
// Функція підключення галереї зображень
function initialGallery() {
    gallery = new SimpleLightbox('.gallery a');

    gallery.on('show.simplelightbox', function () {
        // Do something…
    });
}

// Функція плавного скролу
function slowlyScroll() {
    const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}