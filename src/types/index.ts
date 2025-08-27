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
  bio?: string;
  avatar?: string;
  birthDate?: Date;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-dizer';
  location?: string;
  interests?: string[];
  isAnonymous?: boolean;
  moodHistory?: MoodEntry[];
  therapySessions?: TherapySession[];
}

export interface Post {
  id: string;
  userId: string;
  author: string;
  isAnonymous: boolean;
  avatar?: string;
  content: string;
  mood: Mood;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
  communityId?: string;
}

export interface Mood {
  emoji: string;
  label: string;
  value: number; // 1-10 scale
  timestamp: Date;
}

export interface MoodEntry {
  id: string;
  mood: Mood;
  notes?: string;
  activities?: string[];
  sleepHours?: number;
  stressLevel?: number;
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
  isEdited?: boolean;
  parentCommentId?: string; // Para comentários aninhados
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  memberCount: number;
  posts: Post[];
  rules: string[];
  isPrivate: boolean;
  moderators: string[];
  createdAt: Date;
}

export interface TherapySession {
  id: string;
  clientId: string;
  psychologistId: string;
  date: Date;
  duration: number; // em minutos
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'session' | 'reminder';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
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
  communities: CommunityGroup[];
  notifications: Notification[];
  activeTab: string;
  isLoading: boolean;
  error: string | null;
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
