import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { files, folders } from '../services/api';
import { 
  MagnifyingGlassIcon, 
  FolderIcon, 
  DocumentIcon, 
  LockClosedIcon,
  LockOpenIcon,
  EllipsisVerticalIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const WhisperVault = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [encryptionType, setEncryptionType] = useState('aes-256-gcm');

  useEffect(() => {
    fetchVaultItems();
  }, []);

  const fetchVaultItems = async () => {
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        files.getAll(),
        folders.getAll(),
      ]);

      const vaultFiles = filesResponse.data
        .filter(file => file.isEncrypted)
        .map(file => ({
          ...file,
          type: 'file',
        }));

      const vaultFolders = foldersResponse.data
        .filter(folder => folder.isEncrypted)
        .map(folder => ({
          ...folder,
          type: 'folder',
        }));

      setItems([...vaultFolders, ...vaultFiles]);
    } catch (error) {
      toast.error('Failed to fetch vault items');
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

  const handleEncrypt = async () => {
    try {
      if (!encryptionKey) {
        toast.error('Please enter an encryption key');
        return;
      }

      if (selectedItem.type === 'file') {
        await files.encrypt(selectedItem._id, {
          key: encryptionKey,
          type: encryptionType,
        });
      } else {
        await folders.encrypt(selectedItem._id, {
          key: encryptionKey,
          type: encryptionType,
        });
      }

      fetchVaultItems();
      toast.success('Item encrypted successfully');
      handleDialogClose();
    } catch (error) {
      toast.error('Failed to encrypt item');
    }
  };

  const handleDecrypt = async () => {
    try {
      if (!encryptionKey) {
        toast.error('Please enter the encryption key');
        return;
      }

      if (selectedItem.type === 'file') {
        await files.decrypt(selectedItem._id, {
          key: encryptionKey,
        });
      } else {
        await folders.decrypt(selectedItem._id, {
          key: encryptionKey,
        });
      }

      fetchVaultItems();
      toast.success('Item decrypted successfully');
      handleDialogClose();
    } catch (error) {
      toast.error('Failed to decrypt item. Please check your encryption key.');
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedItem.type === 'file') {
        await files.delete(selectedItem._id);
      } else {
        await folders.delete(selectedItem._id);
      }
      fetchVaultItems();
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
    handleMenuClose();
  };

  const handleDialogOpen = (action) => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEncryptionKey('');
    setEncryptionType('aes-256-gcm');
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
        <h1 className="text-3xl font-bold text-primary-600 mb-2">
          WhisperVault
        </h1>
        <p className="text-gray-600 mb-4">
          Secure storage for your sensitive files and folders
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vault items..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleDialogOpen('encrypt')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              Add to Vault
            </button>
          </div>
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
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
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
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  <LockClosedIcon className="h-3 w-3 mr-1" />
                  Encrypted
                </span>
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
              onClick={() => {
                handleMenuClose();
                handleDialogOpen('decrypt');
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <LockOpenIcon className="h-4 w-4" />
              Decrypt
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {openDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedItem?.isEncrypted ? 'Decrypt Item' : 'Encrypt Item'}
                    </h3>
                    <div className="mt-4">
                      <input
                        type="password"
                        placeholder="Enter encryption key"
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {!selectedItem?.isEncrypted && (
                        <select
                          value={encryptionType}
                          onChange={(e) => setEncryptionType(e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="aes-256-gcm">AES-256-GCM</option>
                          <option value="chacha20-poly1305">ChaCha20-Poly1305</option>
                        </select>
                      )}
                      <div className="mt-4 flex items-start">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="ml-3 text-sm text-gray-500">
                          {selectedItem?.isEncrypted
                            ? 'Enter the encryption key to decrypt this item.'
                            : 'Choose an encryption type and enter a key to encrypt this item.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={selectedItem?.isEncrypted ? handleDecrypt : handleEncrypt}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {selectedItem?.isEncrypted ? 'Decrypt' : 'Encrypt'}
                </button>
                <button
                  type="button"
                  onClick={handleDialogClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhisperVault; 