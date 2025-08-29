// Tipos principais da aplicação
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'cliente' | 'psicologo' | 'admin';
  profileData?: UserProfile;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  website?: string;
  role: 'cliente' | 'psicologo' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastSeen?: Date;
  postCount: number;
  likedPosts: string[];
  followers: string[];
  following: string[];
  blockedUsers: string[];
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  therapySessions?: TherapySession[];
}

export interface Post {
  id: string;
  userId: string;
  author: string;
  isAnonymous: boolean;
  avatar?: string;
  content: string;
  mood?: Mood;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
  communityId?: string;
  likedBy: string[]; // Array de user IDs que curtiram
  reportedBy?: string[]; // Array de user IDs que reportaram
  isReported?: boolean;
  isHidden?: boolean;
}

export interface Mood {
  emoji: string;
  label: string;
  value: number;
  timestamp?: Date;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: Mood;
  cause?: string;
  notes?: string;
  intensity: number; // 1-10
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: string;
  avatar?: string;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
  parentCommentId?: string; // Para comentários aninhados
  likedBy: string[]; // Array de user IDs que curtiram
  reportedBy?: string[]; // Array de user IDs que reportaram
  isReported?: boolean;
  isHidden?: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  lastActivity: string;
  isMember: boolean;
  isFeatured: boolean;
  rating: number;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  content: string;
  imageUrl?: string | null;
  likes: string[];
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export interface FullPost extends Post {
  authorDisplayName: string;
  authorPhotoURL?: string | null;
}

export interface TherapySession {
  id: string;
  clientId: string;
  psychologistId: string;
  date: Date;
  duration: number; // em minutos
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  rating?: number; // 1-5
  feedback?: string;
}

export interface Notification {
  id: string;
  type: 'like_post' | 'comment' | 'follow' | 'therapy_session' | 'system';
  recipientId: string;
  senderId?: string;
  senderName?: string;
  postId?: string;
  postContent?: string;
  commentId?: string;
  commentContent?: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  dataSharing: boolean;
  allowTagging: boolean;
  allowMentioning: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  groupNotifications: boolean;
  sessionReminders: boolean;
  moodReminders: boolean;
  weeklyReports: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  followNotifications: boolean;
}

export interface UserStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  averageMood: number;
  streakDays: number;
  lastActivity: Date;
}

export interface SearchResult {
  type: 'user' | 'post' | 'community';
  id: string;
  title: string;
  description?: string;
  image?: string;
  relevance: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  postId?: string;
  commentId?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  action?: 'warning' | 'suspension' | 'ban' | 'none';
}

export interface Analytics {
  userId: string;
  date: Date;
  postsCreated: number;
  likesGiven: number;
  likesReceived: number;
  commentsGiven: number;
  commentsReceived: number;
  timeSpent: number; // em minutos
  moodAverage: number;
  communityEngagement: number;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress?: number;
  maxProgress?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  uploadedAt: Date;
  isPublic: boolean;
  postId?: string;
  commentId?: string;
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: 'cliente' | 'psicologo';
}

export interface ProfileForm {
  displayName?: string;
  bio?: string;
  birthDate?: Date;
  gender?: string;
  location?: string;
  interests?: string[];
}

// Tipos para estados da aplicação
export interface AppState {
  user: User | null;
  posts: Post[];
  communities: Community[];
  notifications: Notification[];
  activeTab: string;
  isLoading: boolean;
  error: string | null;
}

export interface Friend {
  uid: string;
  displayName: string;
  photoURL?: string;
  lastSeen?: Date; // Adicione o campo lastSeen para status online/offline
  // Adicione outros campos relevantes do perfil do amigo, se necessário
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Tipos para hooks personalizados
export interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  createPost: (post: Omit<Post, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileForm) => Promise<void>;
}

export interface SuggestedCommunitiesResponse {
  communities: Community[];
}
