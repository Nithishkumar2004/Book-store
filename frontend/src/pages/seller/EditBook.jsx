import axios from 'axios';
import { useSnackbar } from 'notistack';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/Spinner';

const EditBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [coverImage, setCoverImage] = useState(null); // New state for cover image
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/books/${id}`);
        const d = await response.data;
        setAuthor(d.data.author);
        setPublishYear(d.data.publishYear);
        setTitle(d.data.title);
        // Assume coverImage is returned as a Base64 string or URL
        setCoverImage(d.data.coverImage);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        alert('An error happened. Please check console');
      }
    };

    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file); // Set the new cover image file
  };

  const handleEditBook = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('publishYear', publishYear);
    if (coverImage) {
      formData.append('coverImage', coverImage); // Append cover image if available
    }

    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/books/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      enqueueSnackbar('Book Edited Successfully', { variant: 'success' });
      navigate('/');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error', { variant: 'error' });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl my-4">Edit Book</h1>
      {loading ? <Spinner /> : ''}
      <div className="flex flex-col border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto">
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Publish Year</label>
          <input
            type="text"
            value={publishYear}
            onChange={(e) => setPublishYear(e.target.value)}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-500">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border-2 border-gray-500 px-4 py-2 w-full"
          />
        </div>
        {coverImage && (
          <div className="my-4">
            <img
              src={URL.createObjectURL(coverImage)} // Create a URL for the preview
              alt="Cover Preview"
              className="w-32 h-32 object-cover mx-auto"
            />
          </div>
        )}
        <button className="p-2 bg-sky-300 m-8" onClick={handleEditBook}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditBook;
