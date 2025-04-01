import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import Header from './Header/Header';
import getImages from '../services/api';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import ImageGallery from './ImageGallery/ImageGallery';
import ImageModal from './ImageModal/ImageModal';
import Loader from './Loader/Loader';
import LoadMoreBtn from './LoadMoreBtn/LoadMoreBtn';
import SearchBar from './SearchBar/SearchBar';



export default function App() {
  const [searchValue, setSearchValue] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loader, setLoader] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState('');

  useEffect(() => {
    if (searchValue.trim() === '') {
      return;
    }

    const fetchImages = async () => {
      try {
        setLoader(true);
        setError(null);

        const { images: newImages, total } = await getImages(searchValue, page);
        if (newImages.length === 0) {
          toast.error('No images found. Try another query.');
          setImages([]);
        } else {
          const totalImages = total;
          const totalPages = Math.ceil(totalImages / 12);
          setImages(prevState => [...prevState, ...newImages]);
          setTotalPages(totalPages);
        }
      } catch (error) {
        setError('Failed to load images');
        console.log(error);
        setImages([]);
      } finally {
        setLoader(false);
      }
    };
    fetchImages();
  }, [searchValue, page]);

  const handleSearch = query => {
    if (query === searchValue) {
      setPage(1);
    } else {
      setSearchValue(query);
      setImages([]);
      setPage(1);
      setTotalPages(0);
      setError(null);
    }
  };

  const handleLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  const openModal = largeImageURL => {
    setLargeImageURL(largeImageURL);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    < >
      <Header />
      <SearchBar onSearch={handleSearch} />
      {loader && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!error && images.length > 0 && (
        <ImageGallery images={images} showModal={openModal} />
      )}
      {images.length > 0 && page < totalPages && (
        <LoadMoreBtn onLoadMore={handleLoadMore} />
      )}
      <Toaster position="top-right" />
      {modalOpen && (
        <ImageModal
          isOpen={modalOpen}
          onRequestClose={closeModal}
          largeImageURL={largeImageURL}
        />
      )}
    </>
  );
};

