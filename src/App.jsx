import React, { useState, useEffect } from 'react';
// Import các hàm cần thiết từ thư viện Firebase
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// =================================================================
// CẤU HÌNH FIREBASE
// =================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Khởi tạo ứng dụng Firebase và kết nối cơ sở dữ liệu Firestore an toàn (Chống lỗi trắng màn hình)
let app;
let db;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase:", error);
  }
} else {
  console.warn("⚠️ Cảnh báo: Thiếu biến môi trường Firebase trên Vercel! Hãy kiểm tra lại tab Environment Variables.");
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Các State lưu trữ dữ liệu kéo về
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dailySubmissions, setDailySubmissions] = useState({});

  const [screen, setScreen] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form đăng nhập / đăng ký
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');

  // 1. Quản lý Dark Mode theo hệ thống
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // 2. LẮNG NGHE DỮ LIỆU REALTIME TỪ FIREBASE CLOUD
  useEffect(() => {
    // Nếu Firebase chưa cấu hình xong, bỏ qua để tránh sập ứng dụng gây trắng màn hình
    if (!db) return;

    // Tự động đồng bộ bảng danh sách thành viên (users)
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = [];
      snapshot.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));

      // Nếu chưa có tài khoản admin nào, tự động tạo 1 tài khoản mặc định ban đầu
      if (usersList.length === 0) {
        const adminRef = doc(db, "users", "admin_omely");
        setDoc(adminRef, {
          email: 'omelytour@gmail.com',
          password: '1',
          name: 'Quản trị viên Omely',
          role: 'admin',
          position: 'Giám đốc',
          avatar: 'https://ui-avatars.com/api/?name=Admin+Omely'
        });
      }
      setUsers(usersList);
    }, (error) => {
      console.error("Lỗi đồng bộ dữ liệu Users từ Cloud:", error);
    });

    // Tự động đồng bộ bảng danh sách công việc (tasks)
    const unsubscribeTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksList = [];
      snapshot.forEach(doc => tasksList.push({ id: doc.id, ...doc.data() }));
      setTasks(tasksList);
    }, (error) => {
      console.error("Lỗi đồng bộ dữ liệu Tasks từ Cloud:", error);
    });

    // Tự động đồng bộ tình trạng chốt báo cáo ngày (dailySubmissions)
    const unsubscribeSubmissions = onSnapshot(collection(db, "dailySubmissions"), (snapshot) => {
      const submissionsMap = {};
      snapshot.forEach(doc => {
        submissionsMap[doc.id] = doc.data().isFinalized;
      });
      setDailySubmissions(submissionsMap);
    }, (error) => {
      console.error("Lỗi đồng bộ dữ liệu Submissions từ Cloud:", error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeTasks();
      unsubscribeSubmissions();
    };
  }, []);

  // Xử lý Đăng ký tài khoản mới
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!db) return alert("Hệ thống Cloud chưa được kết nối. Hãy kiểm tra cấu hình Vercel!");
    if (!email || !password || !name || !position) return alert('Vui lòng điền đủ thông tin, bao gồm cả vị trí làm việc');
    if (users.some(u => u.email === email)) return alert('Email này đã tồn tại');

    try {
      const cleanEmailId = email.replace(/\./g, '_'); // Chuyển dấu chấm thành gạch dưới để làm ID tài liệu an toàn
      await setDoc(doc(db, "users", cleanEmailId), {
        email,
        password,
        name,
        position,
        role: 'employee',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
      });
      alert('Đăng ký tài khoản thành công! Hãy đăng nhập.');
      setAuthMode('login');
      setName('');
      setPosition('');
    } catch (err) {
      console.error(err);
      alert('Lỗi đăng ký dữ liệu: ' + err.message);
    }
  };

  // Xử lý Đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setScreen('main');
    } else {
      alert('Sai thông tin đăng nhập hoặc tài khoản chưa được đồng bộ về máy này!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('auth');
    setEmail('');
    setPassword('');
  };

  // Thay đổi phân quyền thành viên
  const handleChangeRole = async (userId, newRole) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      alert("Lỗi phân quyền: " + err.message);
    }
  };

  // Xóa tài khoản nhân sự
  const handleDeleteUser = async (userId) => {
    if (!db) return;
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${userToDelete.name}" khỏi hệ thống?`);
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "users", userId));
        alert(`Đã xóa thành công nhân viên ${userToDelete.name}!`);
      } catch (err) {
        alert("Lỗi khi xóa: " + err.message);
      }
    }
  };

  const handleSaveProfile = async (updatedData) => {
    if (!db) return;
    try {
      if (!currentUser || !currentUser.email) {
        alert("Không tìm thấy thông tin email của người dùng!");
        return;
      }

      const cleanEmailId = currentUser.email.replace(/\./g, '_');
      await setDoc(doc(db, "users", cleanEmailId), updatedData, { merge: true });

      setCurrentUser({ ...currentUser, ...updatedData });
      alert('Cập nhật thông tin cá nhân thành công!');
      setIsProfileOpen(false);
    } catch (error) {
      alert("Lỗi cập nhật hồ sơ: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      {screen === 'auth' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">Omelytour Todolist</h2>
            <p className="text-[11px] text-gray-400 mb-4 font-medium tracking-wider">HỆ THỐNG TODOLIST</p>
            
            {/* Đã sửa sang đường dẫn /logo.png chuẩn và căn giữa */}
            <img
              src="/logo.png"
              alt="Logo Omely"
              className="w-24 h-24 object-contain mx-auto mb-6"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4 text-left">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-medium block mb-1">Họ và tên</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-md dark:bg-gray-700 bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Nhập họ tên" />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Vị trí nhân viên (Chức vụ)</label>
                    <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-2.5 border rounded-md dark:bg-gray-700 bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ví dụ: Nhân viên Sale Tour..." />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-medium block mb-1">Tài khoản Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border rounded-md dark:bg-gray-700 bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ví dụ: omelytour@gmail.com" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Mật khẩu</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border rounded-md dark:bg-gray-700 bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Nhập mật khẩu" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-md font-semibold transition text-sm">
                {authMode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản'}
              </button>
            </form>
            <div className="mt-4 text-center text-xs sm:text-sm">
              {authMode === 'login' ? (
                <p className="text-gray-500">Chưa có tài khoản? <span onClick={() => setAuthMode('register')} className="text-blue-500 cursor-pointer hover:underline font-medium">Đăng ký tại đây</span></p>
              ) : (
                <p className="text-gray-500">Đã có tài khoản? <span onClick={() => setAuthMode('login')} className="text-blue-500 cursor-pointer hover:underline font-medium">Quay lại đăng nhập</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      {screen === 'main' && currentUser && (
        <>
          <nav className="flex flex-col sm:flex-row gap-3 justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {/* Đã sửa đường dẫn logo sang định dạng /logo.png */}
              <img
                src="/logo.png"
                alt="Logo Omely"
                className="w-10 h-10 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">Omelytour Todolist</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 uppercase font-mono font-bold">MÁY CHỦ</span>
            </div>
            <div className="flex items-center space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">{isDarkMode ? '🌞' : '🌙'}</button>
              <div className="flex items-center space-x-3">
                <img src={currentUser.avatar || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-blue-500/30" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-semibold truncate max-w-[100px]">{currentUser.name}</p>
                  <p className="text-[10px] text-blue-500 dark:text-blue-400 block font-medium truncate max-w-[100px]">{currentUser.position || 'Chưa cập nhật'}</p>
                </div>
                <div className="flex items-center space-x-2 border-l pl-2 text-xs">
                  <button onClick={() => setIsProfileOpen(true)} className="text-blue-500 hover:underline font-medium">Sửa</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={handleLogout} className="text-red-500 hover:underline">Thoát</button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-5xl mx-auto mt-4 sm:mt-6 p-3 sm:p-4 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm">
              <span className="text-xs sm:text-sm font-medium text-gray-500">Xem ngày:</span>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-1 sm:p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent outline-none text-xs sm:text-sm" />
            </div>

            {currentUser.role === 'employee' && (
              <EmployeeSection
                tasks={tasks.filter(t => t.date === selectedDate && t.userEmail === currentUser.email)}
                currentUser={currentUser}
                selectedDate={selectedDate}
                isDayFinalized={!!dailySubmissions[`${currentUser.email.replace(/\./g, '_')}_${selectedDate}`]}
                onFinalize={async () => {
                  if (!db) return;
                  const submissionId = `${currentUser.email.replace(/\./g, '_')}_${selectedDate}`;
                  await setDoc(doc(db, "dailySubmissions", submissionId), { isFinalized: true });
                }}
              />
            )}

            {currentUser.role === 'admin' && (
              <div className="space-y-4 sm:space-y-6">
                <AdminTaskView tasks={tasks.filter(t => t.date === selectedDate)} selectedDate={selectedDate} users={users} />
                <AdminUserManagement users={users} currentUser={currentUser} onChangeRole={handleChangeRole} onDeleteUser={handleDeleteUser} />
              </div>
            )}
          </main>

          {isProfileOpen && <ProfileModal currentUser={currentUser} onSave={handleSaveProfile} onClose={() => setIsProfileOpen(false)} />}
        </>
      )}
    </div>
  );
}

// ==================== COMPONENT MODAL HỒ SƠ ====================
function ProfileModal({ currentUser, onSave, onClose }) {
  const [name, setName] = useState(currentUser.name || '');
  const [position, setPosition] = useState(currentUser.position || '');
  const [password, setPassword] = useState(currentUser.password || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) return alert("Ảnh chân dung nên dưới 1MB để nén mượt hơn!");
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !password.trim() || !position.trim()) return alert('Không để trống thông tin');
    onSave({ name, password, position, avatar });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-2xl border dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-bold border-b pb-3 mb-4 text-blue-600 dark:text-blue-400">Chỉnh sửa hồ sơ cá nhân</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group w-16 h-16 sm:w-20 sm:h-20">
              <img src={avatar || 'https://ui-avatars.com/api/?name=User'} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-500 shadow-md" />
              <label className="absolute inset-0 bg-black/50 rounded-full text-[9px] text-white flex items-center justify-center cursor-pointer">
                Đổi ảnh <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold block mb-1 uppercase tracking-wider text-gray-400">Họ và tên hiển thị</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-semibold block mb-1 uppercase tracking-wider text-gray-400">Vị trí làm việc</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none text-sm" />
          </div>
          <div>
            <label className="text-[11px] font-semibold block mb-1 uppercase tracking-wider text-gray-400">Mật khẩu đăng nhập</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none text-sm" />
          </div>
          <div className="flex justify-end space-x-2 border-t pt-4 mt-6 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded font-bold">Hủy</button>
            <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-bold shadow">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== KHỐI TRANG TODOLIST CỦA NHÂN VIÊN ====================
function EmployeeSection({ tasks, currentUser, selectedDate, isDayFinalized, onFinalize }) {
  const [input, setInput] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const addTask = async (e) => {
    e.preventDefault();
    if (!db) return;
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "tasks"), {
        userEmail: currentUser.email,
        userName: currentUser.name,
        title: input,
        status: 'todo',
        date: selectedDate,
        img: null
      });
      setInput('');
    } catch (err) {
      alert("Lỗi thêm công việc: " + err.message);
    }
  };

  const updateStatus = async (id, status) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "tasks", id), {
        status,
        img: status === 'done' ? null : null
      });
    } catch (err) {
      alert("Lỗi cập nhật trạng thái: " + err.message);
    }
  };

  const handleFileChange = (id, e) => {
    if (!db) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 600 * 1024) return alert("Để đồng bộ đa thiết bị tốc độ cao, vui lòng chọn ảnh báo cáo gọn nhẹ dưới 600KB!");

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await updateDoc(doc(db, "tasks", id), { img: reader.result, status: 'done' });
        } catch (err) {
          alert("Lỗi đồng bộ ảnh: " + err.message);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEditingTask = async (id) => {
    if (!db) return;
    if (!editingTitleText.trim()) return alert("Vui lòng không bỏ trống tên công việc!");
    try {
      await updateDoc(doc(db, "tasks", id), { title: editingTitleText });
      setEditingTaskId(null);
    } catch (err) {
      alert("Lỗi sửa công việc: " + err.message);
    }
  };

  const handleDeleteTask = async (id, title) => {
    if (!db) return;
    const isConfirmed = window.confirm(`Bạn có chắc muốn xóa việc: "${title}"?`);
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "tasks", id));
      } catch (err) {
        alert("Lỗi xóa công việc: " + err.message);
      }
    }
  };

  const canFinalize = tasks.length > 0 && tasks.every(t => t.status !== 'done' || t.img !== null);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between border-b pb-2 dark:border-gray-700">
        <div>
          <h3 className="font-bold text-sm sm:text-base">Todolist công việc cá nhân</h3>
          <p className="text-xs text-gray-400 font-medium">Vị trí: <span className="text-blue-500">{currentUser.position || 'Chưa thiết lập'}</span></p>
        </div>
        {isDayFinalized && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold rounded-full self-center">✓ Đã chốt ngày</span>}
      </div>

      {!isDayFinalized ? (
        <form onSubmit={addTask} className="flex">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Thêm đầu việc mới..." className="flex-1 p-2 text-xs sm:text-sm border rounded-l dark:bg-gray-700 bg-transparent outline-none focus:ring-1 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white px-3 sm:px-4 text-xs sm:text-sm rounded-r font-medium">Thêm</button>
        </form>
      ) : (
        <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded">Ngày làm việc này đã gửi báo cáo thành công.</p>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Hôm nay chưa thiết lập mục tiêu.</p>
        ) : (
          tasks.map(t => (
            <div key={t.id} className="flex flex-col sm:flex-row justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded border dark:border-gray-700 gap-3 items-start sm:items-center">
              {editingTaskId === t.id ? (
                <div className="flex items-center space-x-2 w-full sm:flex-1 mr-2">
                  <input type="text" value={editingTitleText} onChange={(e) => setEditingTitleText(e.target.value)} className="flex-1 p-1.5 text-xs sm:text-sm border rounded dark:bg-gray-700 bg-white outline-none ring-1 ring-blue-500" />
                  <button onClick={() => saveEditingTask(t.id)} className="bg-blue-500 text-white text-[10px] px-2 py-1.5 rounded font-bold">Lưu</button>
                  <button onClick={() => setEditingTaskId(null)} className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-[10px] px-2 py-1.5 rounded">Hủy</button>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <span className={`text-xs sm:text-sm block break-words ${t.status === 'done' ? 'line-through text-gray-400' : 'font-medium'}`}>{t.title}</span>
                  {!isDayFinalized && (
                    <div className="flex items-center space-x-2 mt-1 text-[11px]">
                      <button onClick={() => { setEditingTaskId(t.id); setEditingTitleText(t.title); }} className="text-blue-500 hover:underline font-medium">Chỉnh sửa</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => handleDeleteTask(t.id, t.title)} className="text-red-500 hover:underline font-medium">Xóa bỏ</button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                {t.status === 'done' && (
                  <div className="flex items-center">
                    {t.img ? (
                      <div className="relative group">
                        <img src={t.img} className="w-9 h-9 rounded object-cover border" alt="proof" />
                        {!isDayFinalized && (
                          <label className="absolute inset-0 bg-black/60 text-[8px] text-white flex items-center justify-center rounded cursor-pointer">
                            Đổi <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(t.id, e)} />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-orange-500 text-white text-[10px] px-2 py-1 rounded shadow-sm">
                        📸 Tải ảnh <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(t.id, e)} />
                      </label>
                    )}
                  </div>
                )}
                <select value={t.status} disabled={isDayFinalized} onChange={(e) => updateStatus(t.id, e.target.value)} className="p-1 text-[11px] rounded border outline-none w-24 dark:bg-gray-800 bg-white">
                  <option value="todo">Chưa làm</option>
                  <option value="doing">Đang làm</option>
                  <option value="done">Hoàn thành</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {!isDayFinalized && tasks.length > 0 && (
        <button onClick={onFinalize} disabled={!canFinalize} className={`w-full mt-3 text-xs sm:text-sm font-bold py-2.5 rounded shadow transition ${canFinalize ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          🚀 Gửi báo cáo & Khóa tiến độ ngày
        </button>
      )}
    </div>
  );
}

// ==================== KHỐI TIẾN ĐỘ THEO DÕI CỦA ADMIN ====================
function AdminTaskView({ tasks, selectedDate, users }) {
  const [previewImg, setPreviewImg] = useState(null);
  const tasksForSelectedDate = tasks.filter(t => t.date === selectedDate);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
      <h3 className="font-bold text-sm sm:text-base mb-3 border-b pb-2 text-blue-600">Tiến độ nhân sự Realtime: {selectedDate}</h3>
      <div className="space-y-4">
        {users.filter(u => u.role !== 'admin').map(user => {
          const userTasks = tasksForSelectedDate.filter(t => t.userEmail === user.email);
          return (
            <div key={user.id} className="p-3 border rounded-lg bg-gray-50/50 dark:bg-gray-700/10">
              <div className="flex justify-between items-center mb-2 border-b pb-1 dark:border-gray-700">
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${userTasks.length > 0 && userTasks.every(t => t.status === 'done') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {userTasks.length === 0 ? 'Chưa có việc' : userTasks.every(t => t.status === 'done') ? 'Hoàn thành' : 'Đang làm'}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {userTasks.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-xs py-2 gap-4">
                    <span className="text-gray-600 dark:text-gray-300 break-words flex-1">{t.title}</span>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {t.status === 'done' && t.img && (
                        <img src={t.img} alt="Báo cáo hoàn thành" onClick={() => setPreviewImg(t.img)} className="w-7 h-7 rounded object-cover border border-blue-400 cursor-zoom-in hover:scale-110 transition duration-150" />
                      )}
                      <span className={`font-bold text-[11px] ${t.status === 'done' ? 'text-green-600' : t.status === 'doing' ? 'text-amber-500' : 'text-gray-400'}`}>
                        {t.status === 'done' ? '✓ Đã xong' : t.status === 'doing' ? '⏳ Đang làm' : '⭕ Chưa làm'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {previewImg && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-3xl max-h-[85vh] bg-white dark:bg-gray-800 p-2 rounded-lg shadow-2xl">
            <button onClick={() => setPreviewImg(null)} className="absolute -top-10 right-0 text-white bg-black/50 px-3 py-1 rounded-full text-xs">Đóng</button>
            <img src={previewImg} alt="Chi tiết" className="max-w-full max-h-[75vh] object-contain rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== KHỐI QUẢN LÝ THÀNH VIÊN CỦA ADMIN ====================
function AdminUserManagement({ users, currentUser, onChangeRole, onDeleteUser }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
      <h3 className="font-bold text-sm sm:text-base mb-3 border-b pb-2 text-purple-600">Phân quyền tài khoản hệ thống (Cloud)</h3>
      <div className="overflow-x-auto w-full border rounded">
        <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-400 text-[10px] uppercase">
              <th className="p-2">Nhân sự</th>
              <th className="p-2">Vị trí công tác</th>
              <th className="p-2">Email</th>
              <th className="p-2">Quyền hạn</th>
              <th className="p-2 text-right">Điều chỉnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50">
                <td className="p-2 flex items-center space-x-2">
                  <img src={u.avatar || 'https://ui-avatars.com/api/?name=User'} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="avatar" />
                  <span className="font-medium whitespace-nowrap">{u.name}</span>
                </td>
                <td className="p-2 text-blue-600 font-medium whitespace-nowrap">{u.position || 'Chưa thiết lập'}</td>
                <td className="p-2 text-gray-500 font-mono text-[11px]">{u.email}</td>
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role ? u.role.toUpperCase() : 'EMPLOYEE'}
                  </span>
                </td>
                <td className="p-2 text-right">
                  {u.email === currentUser.email ? (
                    <span className="text-[11px] text-gray-400 italic whitespace-nowrap">Chính bạn</span>
                  ) : (
                    <div className="flex items-center justify-end space-x-2">
                      <select value={u.role || 'employee'} onChange={(e) => onChangeRole(u.id, e.target.value)} className="p-1 text-[11px] border rounded outline-none dark:bg-gray-700 bg-transparent">
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => onDeleteUser(u.id)} className="px-2 py-1 text-[11px] font-medium text-red-600 hover:text-white border border-red-300 hover:bg-red-600 rounded transition duration-200">Xóa</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}