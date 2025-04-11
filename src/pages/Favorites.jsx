import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { files, folders } from '../services/api';
import { SearchIcon, FolderIcon, DocumentIcon, StarIcon, DotsVerticalIcon } from '@heroicons/react/outline';

const Favorites = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        files.getAll(),
        folders.getAll(),
      ]);

      const favoritedFiles = filesResponse.data
        .filter(file => file.isFavorite)
        .map(file => ({
          ...file,
          type: 'file',
        }));

      const favoritedFolders = foldersResponse.data
        .filter(folder => folder.isFavorite)
        .map(folder => ({
          ...folder,
          type: 'folder',
        }));

      setItems([...favoritedFolders, ...favoritedFiles]);
    } catch (error) {
      toast.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleRemoveFavorite = async () => {
    try {
      if (selectedItem.type === 'file') {
        await files.toggleFavorite(selectedItem._id);
      } else {
        await folders.toggleFavorite(selectedItem._id);
      }
      fetchFavorites();
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      if (selectedItem.type === 'file') {
        await files.delete(selectedItem._id);
      } else {
        await folders.delete(selectedItem._id);
      }
      fetchFavorites();
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
    handleMenuClose();
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">
          Favorites
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item._id}
            variants={item}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                {item.type === 'folder' ? (
                  <FolderIcon className="h-10 w-10 text-primary-500" />
                ) : (
                  <DocumentIcon className="h-10 w-10 text-secondary-500" />
                )}
                <button
                  onClick={(e) => handleMenuOpen(e, item)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.type === 'folder' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {item.type}
                </span>
                <StarIcon className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {anchorEl && (
        <div className="fixed inset-0 z-50" onClick={handleMenuClose}>
          <div className="absolute inset-0 bg-black bg-opacity-25" />
          <div
            className="absolute right-4 top-4 w-48 bg-white rounded-lg shadow-lg py-1"
            style={{
              top: anchorEl.getBoundingClientRect().bottom + 8,
              left: anchorEl.getBoundingClientRect().left - 192,
            }}
          >
            <button
              onClick={handleRemoveFavorite}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <StarIcon className="h-4 w-4" />
              Remove from Favorites
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites; 