import {
  Archive,
  Bookmark,
  Camera,
  Copy,
  Download,
  Edit,
  EyeOff,
  FileText,
  Flag,
  Heart,
  Image as ImageIcon,
  Mic,
  Pin,
  Send,
  Share,
  Star,
  Trash2,
} from 'lucide-react-native';
import { Icon } from '@/components/ui';

export const mediaActions = [
  { title: 'Take Photo', onPress: () => console.log('Take photo'), icon: <Icon as={Camera} /> },
  { title: 'Choose from Gallery', onPress: () => console.log('Gallery'), icon: <Icon as={ImageIcon} /> },
  { title: 'Record Audio', onPress: () => console.log('Audio'), icon: <Icon as={Mic} /> },
  { title: 'Add Document', onPress: () => console.log('Document'), icon: <Icon as={FileText} /> },
];

export const allActions = [
  { title: 'Edit Document', onPress: () => console.log('Edit'), icon: <Icon as={Edit} /> },
  { title: 'Share', onPress: () => console.log('Share'), icon: <Icon as={Share} /> },
  { title: 'Download', onPress: () => console.log('Download'), icon: <Icon as={Download} /> },
  { title: 'Copy Link', onPress: () => console.log('Copy'), icon: <Icon as={Copy} /> },
  { title: 'Archive', onPress: () => console.log('Archive'), icon: <Icon as={Archive} /> },
  { title: 'Pin to Top', onPress: () => console.log('Pin'), icon: <Icon as={Pin} /> },
  { title: 'Add to Favorites', onPress: () => console.log('Favorite'), icon: <Icon as={Heart} /> },
  { title: 'Rate & Review', onPress: () => console.log('Rate'), icon: <Icon as={Star} /> },
  { title: 'Bookmark', onPress: () => console.log('Bookmark'), icon: <Icon as={Bookmark} /> },
  { title: 'Send Message', onPress: () => console.log('Send'), icon: <Icon as={Send} /> },
  { title: 'Hide from Feed', onPress: () => console.log('Hide'), icon: <Icon as={EyeOff} /> },
  { title: 'Report Issue', onPress: () => console.log('Report'), icon: <Icon as={Flag} /> },
  { title: 'Delete', onPress: () => console.log('Delete'), destructive: true, icon: <Icon as={Trash2} /> },
];

export const confirmationActions = [
  { title: 'Yes, Continue', onPress: () => console.log('Confirmed'), destructive: true, centered: true },
];
