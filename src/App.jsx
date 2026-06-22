import React, { useState, useEffect } from 'react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Danh sách tài khoản hệ thống (Bổ sung thêm trường position)
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'omelytour@gmail.com',
      password: 'AdminOmely123@!',
      name: 'Quản trị viên Omely',
      position: 'Điều hành tổng',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+Omely&background=0D8ABC&color=fff'
    },
    {
      id: 2,
      email: 'nhanvien@gmail.com',
      password: '123456',
      name: 'Nguyễn Văn Nhân Viên',
      position: 'Nhân viên Sale Tour',
      role: 'employee',
      avatar: 'https://ui-avatars.com/api/?name=NV'
    },
  ]);

  const [tasks, setTasks] = useState([]);
  const [dailySubmissions, setDailySubmissions] = useState({});

  // Form đăng nhập / đăng ký (Thêm state position)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !name || !position) return alert('Vui lòng điền đủ thông tin, bao gồm cả vị trí làm việc');
    if (users.some(u => u.email === email)) return alert('Email này đã tồn tại');

    const newUser = {
      id: Date.now(),
      email,
      password,
      name,
      position, // Lưu vị trí làm việc khi đăng ký
      role: 'employee',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
    };

    setUsers([...users, newUser]);
    alert('Đăng ký tài khoản thành công! Hãy đăng nhập.');
    setAuthMode('login');
    // Reset form
    setName('');
    setPosition('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setScreen('main');
    } else {
      alert('Sai thông tin đăng nhập! Vui lòng kiểm tra lại Email hoặc Mật khẩu.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('auth');
    setEmail('');
    setPassword('');
  };

  const handleChangeRole = (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleSaveProfile = (updatedData) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setTasks(tasks.map(t => t.userEmail === currentUser.email ? { ...t, userName: updatedData.name } : t));
    alert('Cập nhật tài khoản cá nhân thành công!');
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

      {/* MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ */}
      {screen === 'auth' && (
        <div className="flex min-h-screen items-center justify-center mb-6">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-1">
              Omelytour Todolist
            </h2>
            <p className="text-[11px] text-center text-gray-400 mb-6 font-medium tracking-wider">HỆ THỐNG QUẢN LÝ CÔNG VIỆC</p>
            <div className="flex justify-center my-4">
              <img src="/Logo.svg" alt="Logo" className="h-16 w-auto" />
            </div>
            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-medium block mb-1">Họ và tên</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-md dark:bg-gray-700 bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Nhập họ tên của bạn" />
                  </div>
                  {/* BỔ SUNG TRƯỜNG VỊ TRÍ LÀM VIỆC TRÊN FORM ĐĂNG KÝ */}
                  <div>
                    <label className="text-xs font-medium block mb-1">Vị trí nhân viên (Chức vụ)</label>
                    <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-2.5 border rounded-md dark:bg-gray-700 bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ví dụ: Nhân viên Sale Tour, Content Marketing..." />
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
                {authMode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản nhân viên'}
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

      {/* MÀN HÌNH CHÍNH */}
      {screen === 'main' && currentUser && (
        <>
          <nav className="flex flex-col sm:flex-row gap-3 justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <img src="/favicon.png" className="w-8 h-8" alt="Logo" />
                <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">Omelytour Todolist</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 uppercase font-mono font-bold">{currentUser.role}</span>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="sm:hidden p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-700">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="hidden sm:block p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {isDarkMode ? '🌞 Sáng' : '🌙 Tối'}
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-blue-500/30 flex-shrink-0" />
                <div className="text-left max-w-[120px] sm:max-w-none">
                  <p className="text-xs sm:text-sm font-semibold leading-none truncate">{currentUser.name}</p>
                  {/* HIỂN THỊ VỊ TRÍ CỦA USER ĐANG ĐĂNG NHẬP TRÊN NAV */}
                  <p className="text-[10px] text-blue-500 dark:text-blue-400 block font-medium mt-0.5 truncate">{currentUser.position || 'Chưa cập nhật vị trí'}</p>
                </div>

                <div className="flex items-center space-x-2 border-l pl-2 border-gray-200 dark:border-gray-600 text-xs">
                  <button onClick={() => setIsProfileOpen(true)} className="text-blue-500 hover:underline font-medium">Sửa</button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
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

            {/* GIAO DIỆN CỦA NHÂN VIÊN */}
            {currentUser.role === 'employee' && (
              <EmployeeSection
                tasks={tasks.filter(t => t.date === selectedDate && t.userEmail === currentUser.email)}
                setTasks={setTasks}
                currentUser={currentUser}
                selectedDate={selectedDate}
                isDayFinalized={!!dailySubmissions[`${currentUser.email}_${selectedDate}`]}
                onFinalize={() => setDailySubmissions({ ...dailySubmissions, [`${currentUser.email}_${selectedDate}`]: true })}
              />
            )}

            {/* GIAO DIỆN CỦA ADMIN */}
            {currentUser.role === 'admin' && (
              <div className="space-y-4 sm:space-y-6">
                <AdminTaskView tasks={tasks.filter(t => t.date === selectedDate)} selectedDate={selectedDate} dailySubmissions={dailySubmissions} users={users} />
                <AdminUserManagement users={users} currentUser={currentUser} onChangeRole={handleChangeRole} />
              </div>
            )}
          </main>

          {/* POPUP SỬA TÀI KHOẢN */}
          {isProfileOpen && (
            <ProfileModal currentUser={currentUser} onSave={handleSaveProfile} onClose={() => setIsProfileOpen(false)} />
          )}
        </>
      )}
    </div>
  );
}

// ==================== COMPONENT MODAL HỒ SƠ (THÊM SỬA VỊ TRÍ) ====================
function ProfileModal({ currentUser, onSave, onClose }) {
  const [name, setName] = useState(currentUser.name);
  const [position, setPosition] = useState(currentUser.position || '');
  const [password, setPassword] = useState(currentUser.password);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !password.trim() || !position.trim()) return alert('Không để trống thông tin');
    onSave({ name, password, position, avatar });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-bold border-b pb-3 mb-4 text-blue-600 dark:text-blue-400">Chỉnh sửa hồ sơ cá nhân</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2 mb-2">
            <div className="relative group w-16 h-16 sm:w-20 sm:h-20">
              <img src={avatar} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-500 shadow-md" />
              <label className="absolute inset-0 bg-black/50 rounded-full text-[9px] text-white flex items-center justify-center cursor-pointer">
                Đổi ảnh
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold block mb-1 uppercase tracking-wider text-gray-400">Họ và tên hiển thị</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>

          {/* CHO PHÉP SỬA VỊ TRÍ TRONG MODAL HỒ SƠ */}
          <div>
            <label className="text-[11px] font-semibold block mb-1 uppercase tracking-wider text-gray-400">Vị trí làm việc</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>

          <div>
            <label className="text-[11px] font-semibold block mb-1 uppercase tracking-wider text-gray-400">Mật khẩu đăng nhập</label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
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
function EmployeeSection({ tasks, setTasks, currentUser, selectedDate, isDayFinalized, onFinalize }) {
  const [input, setInput] = useState('');

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      userEmail: currentUser.email,
      userName: currentUser.name,
      title: input,
      status: 'todo',
      date: selectedDate,
      img: null
    }]);
    setInput('');
  };

  const updateStatus = (id, status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, img: status === 'done' ? t.img : null } : t));
  };

  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, img: URL.createObjectURL(file), status: 'done' } : t));
    }
  };

  const canFinalize = tasks.length > 0 && tasks.every(t => t.status !== 'done' || t.img !== null);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 dark:border-gray-700 gap-1">
        <div>
          <h3 className="font-bold text-sm sm:text-base">Todolist công việc cá nhân</h3>
          {/* HIỂN THỊ VỊ TRÍ NGAY TRONG TRANG TODOLIST CỦA NHÂN VIÊN */}
          <p className="text-xs text-gray-400 font-medium">Vị trí công tác: <span className="text-blue-500 dark:text-blue-400">{currentUser.position || 'Chưa thiết lập'}</span></p>
        </div>
        {isDayFinalized && <span className="self-start sm:self-center px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 text-[10px] sm:text-xs font-bold rounded-full">✓ Đã chốt ngày</span>}
      </div>

      {!isDayFinalized ? (
        <form onSubmit={addTask} className="flex">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Thêm đầu việc mới..." className="flex-1 p-2 text-xs sm:text-sm border rounded-l dark:bg-gray-700 bg-transparent dark:border-gray-600 outline-none focus:ring-1 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white px-3 sm:px-4 text-xs sm:text-sm rounded-r font-medium">Thêm</button>
        </form>
      ) : (
        <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">Ngày làm việc này đã gửi báo cáo thành công.</p>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">Hôm nay chưa thiết lập mục tiêu.</p>
        ) : (
          tasks.map(t => (
            <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded border dark:border-gray-700 gap-3">
              <span className={`text-xs sm:text-sm break-words flex-1 ${t.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'font-medium'}`}>{t.title}</span>

              <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-700">
                {t.status === 'done' && (
                  <div className="flex items-center">
                    {t.img ? (
                      <div className="relative group">
                        <img src={t.img} className="w-9 h-9 rounded object-cover border dark:border-gray-600" alt="proof" />
                        {!isDayFinalized && (
                          <label className="absolute inset-0 bg-black/60 text-[8px] text-white flex items-center justify-center rounded cursor-pointer">
                            Đổi
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(t.id, e)} />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-orange-500 text-white text-[10px] px-2 py-1 rounded shadow-sm">
                        📸 Tải ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(t.id, e)} />
                      </label>
                    )}
                  </div>
                )}

                <select value={t.status} disabled={isDayFinalized} onChange={(e) => updateStatus(t.id, e.target.value)} className="p-1 text-[11px] rounded dark:bg-gray-600 bg-white border dark:border-gray-500 outline-none w-24">
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
        <button
          onClick={onFinalize}
          disabled={!canFinalize}
          className={`w-full mt-3 text-xs sm:text-sm font-bold py-2.5 rounded shadow transition ${canFinalize ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
        >
          🚀 Gửi báo cáo & Khóa tiến độ ngày
        </button>
      )}
    </div>
  );
}

// ==================== KHỐI TIẾN ĐỘ THEO DÕI CỦA ADMIN (HIỂN THỊ VỊ TRÍ) ====================
function AdminTaskView({ tasks, selectedDate, dailySubmissions, users }) {
  // Lọc task theo ngày đã chọn từ Admin
  const tasksForSelectedDate = tasks.filter(t => t.date === selectedDate);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
      <h3 className="font-bold text-sm sm:text-base mb-3 border-b pb-2 dark:border-gray-700 text-blue-600">
        Tiến độ nhân sự ngày: {selectedDate}
      </h3>

      <div className="space-y-4">
        {users.filter(u => u.role !== 'admin').map(user => {
          // Lọc task của từng nhân viên TRONG NGÀY ĐANG CHỌN
          const userTasks = tasksForSelectedDate.filter(t => t.userEmail === user.email);

          return (
            <div key={user.id} className="p-3 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm">{user.name}</span>
                {/* Hiển thị trạng thái dựa trên số lượng công việc đã hoàn thành */}
                <span className={`text-[10px] px-2 py-1 rounded ${userTasks.length > 0 && userTasks.every(t => t.status === 'done')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                  {userTasks.length === 0 ? 'Chưa có việc' :
                    userTasks.every(t => t.status === 'done') ? 'Hoàn thành' : 'Đang làm'}
                </span>
              </div>

              {userTasks.map(t => (
                <div key={t.id} className="flex justify-between text-xs py-1 border-b">
                  <span>{t.title}</span>
                  <span className={`font-bold ${t.status === 'done' ? 'text-green-600' : 'text-gray-400'}`}>
                    {t.status === 'done' ? '✓ Đã xong' : 'Chưa xong'}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== KHỐI QUẢN LÝ THÀNH VIÊN CỦA ADMIN (BỔ SUNG CỘT VỊ TRÍ) ====================
function AdminUserManagement({ users, currentUser, onChangeRole }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
      <h3 className="font-bold text-sm sm:text-base mb-3 border-b pb-2 dark:border-gray-700 text-purple-600 dark:text-purple-400">Phân quyền tài khoản hệ thống</h3>

      <div className="overflow-x-auto w-full border dark:border-gray-700 rounded">
        {/* Tăng độ rộng tối thiểu min-w-[650px] để chứa vừa cột Vị trí công tác */}
        <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 text-gray-400 text-[10px] uppercase">
              <th className="p-2">Nhân sự</th>
              <th className="p-2">Vị trí công tác</th> {/* Cột mới */}
              <th className="p-2">Email</th>
              <th className="p-2">Quyền hạn</th>
              <th className="p-2 text-right">Điều chỉnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                <td className="p-2 flex items-center space-x-2">
                  <img src={u.avatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="avatar" />
                  <span className="font-medium whitespace-nowrap">{u.name}</span>
                </td>
                {/* HIỂN THỊ VỊ TRÍ CÔNG TÁC TRONG BẢNG QUẢN LÝ THÀNH VIÊN */}
                <td className="p-2 text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">{u.position || 'Chưa thiết lập'}</td>

                <td className="p-2 text-gray-500 font-mono text-[11px]">{u.email}</td>
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 text-right">
                  {u.id === currentUser.id ? (
                    <span className="text-[11px] text-gray-400 italic whitespace-nowrap">Chính bạn</span>
                  ) : (
                    <select value={u.role} onChange={(e) => onChangeRole(u.id, e.target.value)} className="p-1 text-[11px] border rounded dark:bg-gray-700 outline-none">
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
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