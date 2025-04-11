import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { files, folders } from '../services/api';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const [filesResponse, foldersResponse] = await Promise.all([
        files.getAll(),
        folders.getAll(),
      ]);

      const formattedFiles = filesResponse.data.map(file => ({
        ...file,
        type: 'file',
      }));

      const formattedFolders = foldersResponse.data.map(folder => ({
        ...folder,
        type: 'folder',
      }));

      setItems([...formattedFolders, ...formattedFiles]);
    } catch (error) {
      toast.error('Failed to fetch items');
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

  const handleFavorite = async () => {
    try {
      if (selectedItem.type === 'file') {
        await files.toggleFavorite(selectedItem._id);
      } else {
        await folders.toggleFavorite(selectedItem._id);
      }
      fetchItems();
      toast.success('Favorite status updated');
    } catch (error) {
      toast.error('Failed to update favorite status');
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
      fetchItems();
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
          Welcome back, {user?.name}!
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              sx={{ mr: 2 }}
            >
              Upload File
            </Button>
            <Button
              variant="outlined"
              startIcon={<FolderIcon />}
            >
              New Folder
            </Button>
          </Grid>
        </Grid>
      </Box>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <motion.div variants={item}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      {item.type === 'folder' ? (
                        <FolderIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                      ) : (
                        <FileIcon sx={{ color: 'secondary.main', fontSize: 40 }} />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" noWrap>
                      {item.name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={item.type}
                        color={item.type === 'folder' ? 'primary' : 'secondary'}
                        sx={{ mr: 1 }}
                      />
                      {item.isFavorite && (
                        <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleFavorite}>
          {selectedItem?.isFavorite ? (
            <>
              <StarBorderIcon sx={{ mr: 1 }} /> Remove from Favorites
            </>
          ) : (
            <>
              <StarIcon sx={{ mr: 1 }} /> Add to Favorites
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Dashboard; 