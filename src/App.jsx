import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, Package, Calendar, User, 
  ChevronDown, ChevronUp, PlusCircle, 
  List, BarChart3, Calculator, FileText,
  Filter, RotateCcw, Edit, Trash2, X, AlertCircle, Check, Info
} from 'lucide-react';

const initialRecords = [
  {
    id: 1,
    reporterName: 'สมชาย ใจดี',
    dateTime: '2026-07-18T09:30',
    branch: 'สาขา 1',
    productName: 'นมสดพาสเจอร์ไรส์ 2L',
    quantity: 2,
    price: 95,
    totalValue: 190,
  },
  {
    id: 2,
    reporterName: 'สมหญิง รักงาน',
    dateTime: '2026-07-17T14:15',
    branch: 'ร้านของชำ',
    productName: 'ไข่ไก่ เบอร์ 0 (แผง)',
    quantity: 1,
    price: 140,
    totalValue: 140,
  },
  {
    id: 3,
    reporterName: 'วิชัย เก่งกล้า',
    dateTime: '2026-07-18T11:00',
    branch: 'สาขา 3',
    productName: 'น้ำยาซักผ้า 1.5L',
    quantity: 3,
    price: 120,
    totalValue: 360,
  }
];

const BRANCHES = ['สาขา 1', 'สาขา 2', 'สาขา 3', 'สาขา 4', 'สาขา 5', 'ร้านของชำ'];

export default function App() {
  const [records, setRecords] = useState(initialRecords);
  const [activeTab, setActiveTab] = useState('summary'); 
  
  // State สำหรับตัวกรอง
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterBranch, setFilterBranch] = useState('ทั้งหมด');

  // State สำหรับแก้ไขบิล
  const [editingRecord, setEditingRecord] = useState(null);

  // State สำหรับ Custom Dialog (แทนที่ alert และ confirm)
  const [dialog, setDialog] = useState({ isOpen: false, type: '', message: '', onConfirm: null });

  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, onConfirmCallback) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm: onConfirmCallback });
  const closeDialog = () => setDialog({ isOpen: false, type: '', message: '', onConfirm: null });

  // ฟังก์ชันบันทึกข้อมูล
  const handleSaveRecord = (dataArray) => {
    if (editingRecord) {
      setRecords([...dataArray, ...records.filter(r => r.id !== editingRecord.id)]);
      setEditingRecord(null);
    } else {
      setRecords([...dataArray, ...records]);
    }
    setActiveTab('list');
  };

  const handleDeleteRecord = (id) => {
    showConfirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ประวัติจะถูกลบถาวร', () => {
      setRecords(records.filter(r => r.id !== id));
      closeDialog();
    });
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setActiveTab('form');
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setActiveTab('list');
  };

  const filteredRecords = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    return records.filter(r => {
      const rDateFull = new Date(r.dateTime);
      const rDateStr = r.dateTime.split('T')[0];
      
      const match14Days = rDateFull >= fourteenDaysAgo && rDateFull <= today;
      const matchStart = filterStartDate ? rDateStr >= filterStartDate : true;
      const matchEnd = filterEndDate ? rDateStr <= filterEndDate : true;
      const matchBranch = filterBranch !== 'ทั้งหมด' ? r.branch === filterBranch : true;
      
      return match14Days && matchStart && matchEnd && matchBranch;
    });
  }, [records, filterStartDate, filterEndDate, filterBranch]);

  const minAllowedDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24 md:pb-10 selection:bg-fuchsia-200">
      {/* Header - Vibrant Gradient */}
      <header className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Store size={26} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow-sm">Lost & Found</h1>
              <p className="text-[10px] md:text-xs font-medium text-white/80 tracking-wide uppercase">Inventory Tracker</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-3 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            <NavButton icon={<BarChart3 size={18}/>} label="สรุปยอด" isActive={activeTab === 'summary'} onClick={() => { setActiveTab('summary'); setEditingRecord(null); }} />
            <NavButton icon={<PlusCircle size={18}/>} label={editingRecord ? "แก้ไขบิล" : "บันทึกบิล"} isActive={activeTab === 'form'} onClick={() => setActiveTab('form')} />
            <NavButton icon={<List size={18}/>} label="ประวัติ" isActive={activeTab === 'list'} onClick={() => { setActiveTab('list'); setEditingRecord(null); }} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-3 md:p-6 mt-2 md:mt-4 relative">
        
        {/* แถบตัวกรอง */}
        {(activeTab === 'summary' || activeTab === 'list') && (
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-6 md:mb-8 flex flex-col md:flex-row gap-4 items-start md:items-end transition-all">
            <div className="flex items-center gap-2 md:mb-2 text-violet-700 font-bold w-full md:w-auto">
              <div className="bg-violet-100 p-2 rounded-xl text-violet-600"><Filter size={20} /></div>
              <span className="text-lg">ตัวกรอง</span>
            </div>
            
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">ตั้งแต่วันที่</label>
                <input 
                  type="date" 
                  value={filterStartDate} 
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  min={minAllowedDate}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold text-slate-700 transition-all"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">ถึงวันที่</label>
                <input 
                  type="date" 
                  value={filterEndDate} 
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  min={filterStartDate || minAllowedDate}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold text-slate-700 transition-all"
                />
              </div>
            </div>

            <div className="w-full md:w-56">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">เลือกสาขา</label>
              <select 
                value={filterBranch} 
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="ทั้งหมด">- แสดงทุกสาขา -</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterBranch('ทั้งหมด'); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm group"
            >
              <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" /> ล้างค่า
            </button>
          </div>
        )}

        {/* แท็บเนื้อหา */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'form' && <RecordForm onSubmit={handleSaveRecord} initialData={editingRecord} onCancel={handleCancelEdit} showAlert={showAlert} />}
          {activeTab === 'list' && <RecordList records={filteredRecords} filterBranch={filterBranch} onEdit={handleEditClick} onDelete={handleDeleteRecord} />}
          {activeTab === 'summary' && <SummaryDashboard filteredRecords={filteredRecords} filterStartDate={filterStartDate} filterEndDate={filterEndDate} filterBranch={filterBranch} />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-safe rounded-t-3xl">
        <MobileNavButton icon={<BarChart3 size={24}/>} label="สรุปยอด" isActive={activeTab === 'summary'} onClick={() => { setActiveTab('summary'); setEditingRecord(null); }} />
        <MobileNavButton icon={<PlusCircle size={24}/>} label={editingRecord ? "แก้ไข" : "บันทึกบิล"} isActive={activeTab === 'form'} onClick={() => setActiveTab('form')} isPrimary={true} />
        <MobileNavButton icon={<List size={24}/>} label="ประวัติบิล" isActive={activeTab === 'list'} onClick={() => { setActiveTab('list'); setEditingRecord(null); }} />
      </nav>

      {/* Custom Dialog Overlay */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-4 ${dialog.type === 'confirm' ? 'bg-rose-50' : 'bg-indigo-50'} flex items-start gap-3`}>
              <div className={`p-2 rounded-full ${dialog.type === 'confirm' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {dialog.type === 'confirm' ? <AlertCircle size={24} /> : <Info size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {dialog.type === 'confirm' ? 'ยืนยันการดำเนินการ' : 'แจ้งเตือน'}
                </h3>
                <p className="text-slate-600 text-sm mt-1">{dialog.message}</p>
              </div>
            </div>
            <div className="p-4 flex gap-3 justify-end bg-slate-50 border-t border-slate-100">
              {dialog.type === 'confirm' && (
                <button 
                  onClick={closeDialog}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
              )}
              <button 
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  else closeDialog();
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors ${
                  dialog.type === 'confirm' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
              >
                {dialog.type === 'confirm' ? 'ยืนยัน' : 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Components ---

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
        isActive 
          ? 'bg-white text-violet-700 shadow-md transform scale-105' 
          : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MobileNavButton({ icon, label, isActive, onClick, isPrimary }) {
  if (isPrimary) {
    return (
      <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center p-2 min-w-[70px] -mt-6`}
      >
        <div className={`p-4 rounded-full shadow-lg text-white transition-transform transform ${isActive ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 scale-110 shadow-violet-500/40' : 'bg-slate-800 hover:scale-105'}`}>
          {icon}
        </div>
        <span className={`text-[11px] mt-1.5 font-bold ${isActive ? 'text-violet-700' : 'text-slate-600'}`}>{label}</span>
      </button>
    );
  }
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center p-2 min-w-[70px] transition-all duration-300 ${isActive ? 'text-violet-600 scale-110' : 'text-slate-400 hover:text-violet-500'}`}
    >
      <div className={`${isActive ? 'bg-violet-100 p-1.5 rounded-xl' : 'p-1.5'}`}>
        {icon}
      </div>
      <span className="text-[11px] mt-1 font-extrabold">{label}</span>
    </button>
  );
}

// 1. Form Component 
function RecordForm({ onSubmit, initialData, onCancel, showAlert }) {
  const [headerData, setHeaderData] = useState({ reporterName: '', dateTime: '', branch: BRANCHES[0] });
  const [currentItem, setCurrentItem] = useState({ productName: '', quantity: '', price: '' });
  const [billItems, setBillItems] = useState([]);

  useEffect(() => {
    if (initialData) {
      setHeaderData({ reporterName: initialData.reporterName, dateTime: initialData.dateTime, branch: initialData.branch });
      setBillItems([{ ...initialData, tempId: Date.now() }]);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setHeaderData({ reporterName: '', dateTime: now.toISOString().slice(0, 16), branch: BRANCHES[0] });
      setBillItems([]);
    }
  }, [initialData]);

  const handleHeaderChange = (e) => setHeaderData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleItemChange = (e) => setCurrentItem(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentItem.productName || !currentItem.quantity || !currentItem.price) {
      showAlert('กรุณากรอกข้อมูลสินค้าให้ครบถ้วนก่อนเพิ่มลงบิล');
      return;
    }
    const qty = parseFloat(currentItem.quantity);
    const prc = parseFloat(currentItem.price);
    
    setBillItems([...billItems, {
      ...currentItem, quantity: qty, price: prc, totalValue: qty * prc, tempId: Date.now() + Math.random()
    }]);

    setCurrentItem({ productName: '', quantity: '', price: '' });
  };

  const handleRemoveItem = (tempId) => setBillItems(billItems.filter(item => item.tempId !== tempId));

  const handleSubmitBill = () => {
    if (!headerData.reporterName) return showAlert('กรุณาระบุชื่อพนักงานผู้บันทึก');
    if (billItems.length === 0) return showAlert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');

    const finalRecords = billItems.map(item => ({
      id: initialData && billItems.length === 1 ? initialData.id : Date.now() + Math.random(), 
      reporterName: headerData.reporterName, dateTime: headerData.dateTime, branch: headerData.branch,
      productName: item.productName, quantity: item.quantity, price: item.price, totalValue: item.totalValue
    }));
    onSubmit(finalRecords);
  };

  const grandTotal = billItems.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* ส่วนหัวบิล */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all">
        <div className={`p-4 md:p-6 flex items-center justify-between gap-3 ${initialData ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 md:p-2.5 rounded-xl md:rounded-2xl backdrop-blur-md">
              {initialData ? <Edit className="text-white" size={24} /> : <FileText className="text-white" size={24} />}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-wide drop-shadow-sm">
              {initialData ? 'แก้ไขประวัติบันทึกบิล' : 'บันทึกบิลสินค้าสูญหาย/ชำรุด'}
            </h2>
          </div>
          {initialData && (
            <button onClick={onCancel} className="text-white hover:bg-white/20 flex items-center gap-1.5 text-xs md:text-sm font-bold bg-white/10 backdrop-blur-md px-3 md:px-4 py-2 rounded-xl transition-colors">
              <X size={18} /> ยกเลิก
            </button>
          )}
        </div>
        
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-white">
          <div>
            <label className="block text-xs md:text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-1.5 uppercase"><User size={16} className="text-violet-500"/> พนักงานผู้บันทึก</label>
            <input type="text" required name="reporterName" value={headerData.reporterName} onChange={handleHeaderChange} className="w-full p-2.5 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all" placeholder="ระบุชื่อพนักงาน" />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-1.5 uppercase"><Calendar size={16} className="text-violet-500"/> วันที่และเวลาเกิดเหตุ</label>
            <input type="datetime-local" required name="dateTime" value={headerData.dateTime} onChange={handleHeaderChange} className="w-full p-2.5 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all" />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-1.5 uppercase"><Store size={16} className="text-violet-500"/> สาขาที่เกิดเหตุ</label>
            <select name="branch" value={headerData.branch} onChange={handleHeaderChange} className="w-full p-2.5 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all cursor-pointer">
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ส่วนเพิ่มรายการสินค้า */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all hover:shadow-2xl hover:shadow-violet-200/40">
        <div className="bg-violet-50/50 p-4 md:p-6 border-b border-violet-100 flex items-center gap-3">
          <div className="bg-violet-100 p-2 rounded-xl">
            <Package size={22} className="text-violet-600" />
          </div>
          <h3 className="text-base md:text-lg font-extrabold text-violet-900">เพิ่มรายการสินค้าลงในบิล</h3>
        </div>
        <form onSubmit={handleAddItem} className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-end">
            <div className="md:col-span-6">
              <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">ชื่อรายการที่หาย</label>
              <input type="text" name="productName" value={currentItem.productName} onChange={handleItemChange} className="w-full p-2.5 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all" placeholder="เช่น นมสด 2L" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-6 md:grid-cols-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">จำนวน</label>
                <input type="number" min="1" step="1" name="quantity" value={currentItem.quantity} onChange={handleItemChange} className="w-full p-2.5 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 outline-none font-bold text-center text-slate-800 transition-all" placeholder="0" />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">ราคา/หน่วย</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">฿</span>
                  <input type="number" min="0" step="0.25" name="price" value={currentItem.price} onChange={handleItemChange} className="w-full pl-8 p-2.5 md:p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 outline-none font-bold text-slate-800 transition-all" placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="md:col-span-12 mt-2 md:mt-0">
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3 md:py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-300 transform hover:-translate-y-0.5 text-sm md:text-base">
                <PlusCircle size={20}/> เพิ่มลงรายการด้านล่าง
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ตารางแสดงรายการในบิล */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-4 md:p-5 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2 rounded-xl text-slate-600"><List size={18} className="md:w-5 md:h-5"/></div>
            <h3 className="font-extrabold text-slate-800 text-base md:text-lg">รายการสินค้าที่เพิ่มแล้ว <span className="text-violet-600 bg-violet-100 px-2 py-0.5 rounded-lg text-sm ml-2">{billItems.length}</span></h3>
          </div>
        </div>
        
        {billItems.length === 0 ? (
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center bg-slate-50/50">
            <div className="bg-slate-100 p-4 rounded-full mb-4"><Package size={40} className="text-slate-300" /></div>
            <p className="font-bold text-slate-400 text-base md:text-lg">ยังไม่มีรายการสินค้า</p>
            <p className="text-xs md:text-sm text-slate-400 mt-1">กรุณาเพิ่มรายการจากฟอร์มด้านบน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* ทำให้เลื่อนแนวนอนได้บนมือถือ เพื่อให้เห็นครบทุกคอลัมน์ */}
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3 md:p-4 font-extrabold">รายการสินค้า</th>
                  <th className="p-3 md:p-4 font-extrabold text-center">จำนวน</th>
                  <th className="p-3 md:p-4 font-extrabold text-right">ราคา/หน่วย</th>
                  <th className="p-3 md:p-4 font-extrabold text-right">ยอดรวม (บาท)</th>
                  <th className="p-3 md:p-4 font-extrabold text-center w-12 md:w-16">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billItems.map((item, index) => (
                  <tr key={item.tempId || index} className="hover:bg-violet-50/50 transition-colors group">
                    <td className="p-3 md:p-4">
                      {/* อนุญาตให้ตัดขึ้นบรรทัดใหม่ */}
                      <p className="font-extrabold text-slate-800 text-sm md:text-base break-words whitespace-normal">{item.productName}</p>
                    </td>
                    <td className="p-3 md:p-4 text-center text-sm md:text-base font-bold text-slate-700 bg-slate-50/50">{item.quantity}</td>
                    <td className="p-3 md:p-4 text-right text-xs md:text-sm font-semibold text-slate-500">{Number(item.price).toLocaleString()}</td>
                    <td className="p-3 md:p-4 text-right text-sm md:text-base font-extrabold text-rose-600">฿{item.totalValue.toLocaleString()}</td>
                    <td className="p-3 md:p-4 text-center">
                      <button onClick={() => handleRemoveItem(item.tempId)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 md:p-2 rounded-xl transition-all" title="ลบรายการนี้">
                        <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                  <td colSpan={3} className="p-4 md:p-5 text-right font-extrabold text-slate-600 text-xs md:text-sm uppercase tracking-wide">ยอดมูลค่ารวมทั้งบิล:</td>
                  <td className="p-4 md:p-5 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 text-lg md:text-2xl">
                    ฿{grandTotal.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ปุ่ม Submit หลัก */}
      <button 
        onClick={handleSubmitBill}
        disabled={billItems.length === 0}
        className={`w-full font-black py-4 md:py-5 px-6 rounded-2xl shadow-xl transition-all duration-300 flex justify-center items-center gap-2 md:gap-3 text-lg md:text-xl ${
          billItems.length === 0 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : initialData 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transform hover:-translate-y-1 hover:shadow-orange-500/30' 
              : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-600 text-white transform hover:-translate-y-1 hover:shadow-fuchsia-500/30'
        }`}
      >
        {initialData ? <Check size={24} className="md:w-7 md:h-7" /> : <FileText size={24} className="md:w-7 md:h-7" />} 
        {initialData ? 'ยืนยันการแก้ไขบิลนี้' : 'ยืนยันการบันทึกบิลเข้าระบบ'}
      </button>

    </div>
  );
}

// 2. List Component 
function RecordList({ records, filterBranch, onEdit, onDelete }) {
  const displayBranches = filterBranch === 'ทั้งหมด' ? BRANCHES : [filterBranch];

  const groupedByBranch = useMemo(() => {
    return displayBranches.reduce((acc, branch) => {
      acc[branch] = records.filter(r => r.branch === branch);
      return acc;
    }, {});
  }, [records, displayBranches]);

  const [expandedGroups, setExpandedGroups] = useState(
    BRANCHES.reduce((acc, branch) => ({ ...acc, [branch]: true }), {})
  );
  const toggleGroup = (branch) => setExpandedGroups(prev => ({ ...prev, [branch]: !prev[branch] }));

  if (records.length === 0) {
    return (
      <div className="text-center py-16 md:py-24 bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center">
        <div className="bg-slate-50 p-5 md:p-6 rounded-full mb-4 md:mb-6">
          <Package size={48} className="text-slate-300 md:w-16 md:h-16" />
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-600">ไม่พบประวัติบันทึกบิล</h3>
        <p className="text-sm md:text-base text-slate-400 mt-2 font-medium">ไม่มีข้อมูลในช่วงเวลาและสาขาที่คุณเลือก</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">ประวัติบันทึกบิล</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">แสดงรายการสูญหายย้อนหลัง</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-slate-200 shadow-sm w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-extrabold text-sm md:text-base text-slate-700">รวมทั้งหมด {records.length} บิล</span>
        </div>
      </div>

      {displayBranches.map(branch => {
        const branchRecords = groupedByBranch[branch];
        if (branchRecords.length === 0) return null; 

        const branchTotalQty = branchRecords.reduce((sum, r) => sum + r.quantity, 0);
        const branchTotalVal = branchRecords.reduce((sum, r) => sum + r.totalValue, 0);
        const isExpanded = expandedGroups[branch];

        return (
          <div key={branch} className="bg-white rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div 
              onClick={() => toggleGroup(branch)} 
              className={`p-4 md:p-5 cursor-pointer flex items-center justify-between transition-colors border-b ${isExpanded ? 'bg-violet-50/50 border-violet-100' : 'bg-white hover:bg-slate-50 border-transparent'}`}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${isExpanded ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-500'}`}>
                  <Store size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg md:text-xl text-slate-800">{branch}</h3>
                  <span className="text-[10px] md:text-xs font-bold text-violet-600 bg-violet-100 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg mt-1 inline-block">
                    {branchRecords.length} รายการ
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">มูลค่าความเสียหาย</p>
                  <p className="font-black text-rose-600 text-base md:text-lg">฿{branchTotalVal.toLocaleString()}</p>
                </div>
                <div className={`p-1.5 md:p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-white shadow-sm rotate-180' : 'bg-slate-50'}`}>
                  <ChevronDown className={isExpanded ? 'text-violet-500' : 'text-slate-400'} size={18} />
                </div>
              </div>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out origin-top ${isExpanded ? 'scale-y-100 opacity-100 max-h-[3000px]' : 'scale-y-0 opacity-0 max-h-0'}`}>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] md:text-xs uppercase tracking-wider border-b border-slate-100">
                      <th className="p-3 md:p-4 pl-4 md:pl-6 font-extrabold min-w-[120px]">วัน/เวลา</th>
                      <th className="p-3 md:p-4 font-extrabold min-w-[150px]">รายการสินค้า</th>
                      <th className="p-3 md:p-4 font-extrabold">พนักงาน</th>
                      <th className="p-3 md:p-4 font-extrabold text-center">จำนวน</th>
                      <th className="p-3 md:p-4 font-extrabold text-right">มูลค่ารวม</th>
                      <th className="p-3 md:p-4 font-extrabold text-center w-20 md:w-28">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {branchRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-3 md:p-4 pl-4 md:pl-6">
                          <div className="font-bold text-slate-700 text-xs md:text-sm whitespace-nowrap">
                            {new Date(record.dateTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </div>
                          <div className="text-[10px] md:text-xs font-semibold text-slate-400 mt-0.5">
                            {new Date(record.dateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </div>
                        </td>
                        <td className="p-3 md:p-4">
                          <p className="font-extrabold text-slate-800 text-sm md:text-base break-words whitespace-normal">{record.productName}</p>
                        </td>
                        <td className="p-3 md:p-4 text-xs md:text-sm font-semibold text-slate-600">
                          <div className="flex items-center gap-1.5 bg-slate-50 w-fit px-2 py-1 md:px-2.5 md:py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                            <User size={12} className="text-violet-400 md:w-[14px] md:h-[14px]"/> {record.reporterName}
                          </div>
                        </td>
                        <td className="p-3 md:p-4 text-center">
                          <span className="font-bold text-slate-700 text-sm md:text-base">{record.quantity}</span>
                        </td>
                        <td className="p-3 md:p-4 text-right">
                          <span className="font-black text-rose-600 text-sm md:text-lg">฿{record.totalValue.toLocaleString()}</span>
                        </td>
                        <td className="p-3 md:p-4 text-center">
                          <div className="flex items-center justify-center gap-1 md:gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(record)} className="p-1.5 md:p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-amber-100" title="แก้ไขบิล">
                              <Edit size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                            <button onClick={() => onDelete(record.id)} className="p-1.5 md:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100" title="ลบบิล">
                              <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 3. Summary Component 
function SummaryDashboard({ filteredRecords, filterStartDate, filterEndDate, filterBranch }) {
  
  const displayDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // ถ้าไม่เลือกอะไรเลย ให้แสดงแค่วันนี้ (วันล่าสุด)
    if (!filterStartDate && !filterEndDate) {
      dates.push(today);
    } else if (filterStartDate && !filterEndDate) {
      // ถ้าเลือกแค่วันเริ่มต้น ให้แสดงแค่วันนั้นวันเดียว
      const d = new Date(filterStartDate);
      d.setHours(0,0,0,0);
      dates.push(d);
    } else if (!filterStartDate && filterEndDate) {
      // ถ้าเลือกแค่วันสิ้นสุด ให้แสดงแค่วันนั้นวันเดียว
      const d = new Date(filterEndDate);
      d.setHours(0,0,0,0);
      dates.push(d);
    } else {
      // ถ้าเลือกทั้งสองช่อง ให้แสดงเป็นช่วงวันที่
      const start = new Date(filterStartDate);
      const end = new Date(filterEndDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      
      let current = new Date(start);
      let safetyLimit = 0;
      while (current <= end && safetyLimit < 15) { 
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
        safetyLimit++;
      }
    }
    return dates;
  }, [filterStartDate, filterEndDate]);

  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // กรองข้อมูลให้ตรงกับคอลัมน์วันที่ที่จะแสดงบนแดชบอร์ด
  const dashboardRecords = useMemo(() => {
    if(displayDates.length === 0) return [];
    const startStr = getLocalDateString(displayDates[0]);
    const endStr = getLocalDateString(displayDates[displayDates.length - 1]);
    
    return filteredRecords.filter(r => {
      const rDateStr = r.dateTime.split('T')[0];
      return rDateStr >= startStr && rDateStr <= endStr;
    });
  }, [filteredRecords, displayDates]);

  // ซ่อนสาขาที่ไม่มีข้อมูลสูญหาย 
  const displayBranches = useMemo(() => {
    if (filterBranch !== 'ทั้งหมด') return [filterBranch]; // ถ้าเจาะจงสาขา ให้โชว์ตามนั้น
    
    // หาเฉพาะสาขาที่มีข้อมูลใน dashboardRecords (ที่มีการคีย์ของหาย)
    const activeBranches = new Set(dashboardRecords.map(r => r.branch));
    return BRANCHES.filter(b => activeBranches.has(b));
  }, [filterBranch, dashboardRecords]);

  const branchSummaries = displayBranches.map(branch => {
    const branchRecords = dashboardRecords.filter(r => r.branch === branch);
    const itemMap = {};
    branchRecords.forEach(r => {
      if(!itemMap[r.productName]) itemMap[r.productName] = 0;
      itemMap[r.productName] += r.quantity;
    });
    const itemsList = Object.entries(itemMap).map(([name, qty]) => ({name, qty}));

    return {
      name: branch,
      incidents: branchRecords.length,
      quantity: branchRecords.reduce((sum, r) => sum + r.quantity, 0),
      value: branchRecords.reduce((sum, r) => sum + r.totalValue, 0),
      itemsList: itemsList
    };
  }).sort((a, b) => b.value - a.value);

  const employeeDeductionSummary = useMemo(() => {
    if (filterBranch === 'ทั้งหมด') return null;
    const branchRecords = dashboardRecords.filter(r => r.branch === filterBranch);
    const grouped = {};
    branchRecords.forEach(r => {
      if (!grouped[r.reporterName]) grouped[r.reporterName] = { totalValue: 0, items: [] };
      grouped[r.reporterName].totalValue += r.totalValue;
      grouped[r.reporterName].items.push({ name: r.productName, qty: r.quantity, val: r.totalValue, date: r.dateTime });
    });
    return Object.entries(grouped).map(([emp, data]) => ({ name: emp, ...data })).sort((a, b) => b.totalValue - a.totalValue);
  }, [filterBranch, dashboardRecords]);

  const grandTotalQuantity = dashboardRecords.reduce((sum, r) => sum + r.quantity, 0);
  const grandTotalValue = dashboardRecords.reduce((sum, r) => sum + r.totalValue, 0);

  const dateRangeText = filterStartDate && filterEndDate 
    ? `(${new Date(filterStartDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short'})} - ${new Date(filterEndDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: 'numeric'})})`
    : filterStartDate ? `(วันที่ ${new Date(filterStartDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: 'numeric'})})`
    : filterEndDate ? `(วันที่ ${new Date(filterEndDate).toLocaleDateString('th-TH', {day: 'numeric', month: 'short', year: 'numeric'})})`
    : '(วันนี้)';

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      
      {/* สรุปหักเงิน (แบบใหม่ - เน้นสีสันและมิติ) */}
      {filterBranch !== 'ทั้งหมด' && (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-rose-200/40 border-0 overflow-hidden relative transform transition-all hover:-translate-y-1">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-orange-500"></div>
          <div className="bg-gradient-to-br from-rose-50 to-white p-4 md:p-6 border-b border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 md:p-2.5 rounded-xl md:rounded-2xl text-rose-600 shadow-inner">
                <AlertCircle size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-rose-900 tracking-tight">สรุปยอดหักเงินพนักงาน</h3>
                <p className="text-xs md:text-sm font-bold text-rose-500 mt-0.5">{dateRangeText}</p>
              </div>
            </div>
            <span className="w-fit bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl font-bold shadow-md shadow-rose-300">
              สาขา: {filterBranch}
            </span>
          </div>
          
          <div className="p-0">
            {employeeDeductionSummary && employeeDeductionSummary.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-white text-slate-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-slate-100">
                      <th className="p-3 md:p-5 pl-4 md:pl-6 font-extrabold w-1/4">ชื่อพนักงาน</th>
                      <th className="p-3 md:p-5 font-extrabold">รายการของที่ทำหาย</th>
                      <th className="p-3 md:p-5 font-extrabold text-right w-1/4 pr-4 md:pr-6">ยอดรวมต้องหัก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employeeDeductionSummary.map(emp => (
                      <tr key={emp.name} className="hover:bg-rose-50/30 transition-colors">
                        <td className="p-3 md:p-5 pl-4 md:pl-6 align-top">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 shadow-inner border border-white shrink-0">
                              <User size={16} className="md:w-5 md:h-5" />
                            </div>
                            <span className="font-extrabold text-slate-800 text-sm md:text-base break-words whitespace-normal">{emp.name}</span>
                          </div>
                        </td>
                        <td className="p-3 md:p-5">
                          <ul className="space-y-1.5 md:space-y-2">
                            {emp.items.map((it, idx) => (
                              <li key={idx} className="flex flex-wrap items-center gap-1 md:gap-2 bg-slate-50/80 w-full sm:w-max px-2 md:px-3 py-1.5 rounded-lg border border-slate-100">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-400 rounded-full shrink-0"></span>
                                <span className="font-bold text-slate-700 text-xs md:text-sm break-words whitespace-normal">{it.name} <span className="text-slate-400 font-semibold">(x{it.qty})</span></span>
                                <span className="text-rose-500 font-extrabold text-xs md:text-sm ml-1 md:ml-2 whitespace-nowrap">฿{it.val.toLocaleString()}</span>
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded ml-1 md:ml-2 shadow-sm border border-slate-100 whitespace-nowrap">
                                  {new Date(it.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-3 md:p-5 pr-4 md:pr-6 text-right font-black text-rose-600 text-lg md:text-2xl align-top">
                          ฿{emp.totalValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 md:p-10 text-center flex flex-col items-center">
                <Check size={40} className="text-emerald-400 mb-2 md:mb-3 md:w-12 md:h-12" />
                <p className="font-extrabold text-slate-500 text-base md:text-lg">ยอดเยี่ยม! ไม่มีรายการสูญหาย</p>
                <p className="text-xs md:text-sm font-medium text-slate-400">ในช่วงเวลาที่เลือก สำหรับสาขานี้</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ตารางสรุปรายการสินค้า */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-50 to-white p-4 md:p-6 border-b border-emerald-100 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 md:p-2.5 rounded-xl md:rounded-2xl text-emerald-600 shadow-inner">
            <Store size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-xl font-black text-emerald-900 tracking-tight">สรุปจำนวนชิ้นสินค้าที่สูญหาย</h3>
            <p className="text-[10px] md:text-sm font-bold text-emerald-500 mt-0.5">{dateRangeText}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {/* ปรับแต่งคลาส CSS ตรงนี้เพื่อแก้ตัวหนังสือตกขอบบนมือถือ โดยไม่ต้องเลื่อน */}
          <table className="w-full text-left min-w-full">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] md:text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-3 md:p-5 font-extrabold w-[80px] md:w-[150px]">สาขา</th>
                <th className="p-3 md:p-5 font-extrabold w-auto">รายละเอียดรายการ</th>
                <th className="p-3 md:p-5 font-extrabold text-center bg-slate-50 w-[60px] md:w-[100px]">รวมชิ้น</th>
                <th className="p-3 md:p-5 font-extrabold text-right bg-slate-50 w-[80px] md:w-[150px]">มูลค่า (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {branchSummaries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 md:p-10 text-center font-bold text-slate-400 text-sm md:text-base">
                    ไม่พบรายการสูญหายในช่วงวันที่เลือก ยอดเยี่ยมมาก! 🎉
                  </td>
                </tr>
              ) : (
                branchSummaries.map((branch, index) => (
                  <tr key={branch.name} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-3 md:p-5 font-extrabold text-slate-800 flex items-center gap-1.5 md:gap-3 text-xs md:text-base break-words whitespace-normal">
                      {branch.value > 0 && <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0 hidden md:block"></span>}
                      {branch.name}
                    </td>
                    <td className="p-3 md:p-5">
                      {branch.itemsList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {branch.itemsList.map((item, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 font-bold text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-slate-200 break-words whitespace-normal">
                              {item.name} <span className="text-slate-400">({item.qty})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs md:text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3 md:p-5 text-center bg-slate-50/50">
                      <span className="font-black text-slate-700 text-sm md:text-lg">
                        {branch.quantity > 0 ? branch.quantity.toLocaleString() : '-'}
                      </span>
                    </td>
                    <td className="p-3 md:p-5 text-right bg-slate-50/50">
                      <span className={`font-black text-xs md:text-xl ${branch.value > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                        {branch.value > 0 ? `฿${branch.value.toLocaleString()}` : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                <td className="p-3 md:p-6 font-extrabold text-slate-600 text-right uppercase tracking-wider text-[10px] md:text-base" colSpan={2}>ยอดสรุปรวมทั้งหมด:</td>
                <td className="p-3 md:p-6 text-center font-black text-slate-800 text-base md:text-2xl">{grandTotalQuantity.toLocaleString()}</td>
                <td className="p-3 md:p-6 text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 text-base md:text-3xl">฿{grandTotalValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}