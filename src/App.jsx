import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, Package, Calendar, User, 
  ChevronDown, PlusCircle, 
  List, BarChart3, FileText,
  Filter, RotateCcw, Edit, Trash2, X, AlertCircle, Check, Info, Loader2
} from 'lucide-react';

const BRANCHES = ['สาขา 1', 'สาขา 2', 'สาขา 3', 'สาขา 4', 'สาขา 5', 'ร้านของชำ'];

export default function App() {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('lostAndFoundData');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }); 
  const [isLoading, setIsLoading] = useState(false); 
  const [activeTab, setActiveTab] = useState('list'); 
  
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterBranch, setFilterBranch] = useState('ทั้งหมด');

  const [editingRecord, setEditingRecord] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, type: '', message: '', onConfirm: null });

  useEffect(() => {
    localStorage.setItem('lostAndFoundData', JSON.stringify(records));
  }, [records]);

  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, onConfirmCallback) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm: onConfirmCallback });
  const closeDialog = () => setDialog({ isOpen: false, type: '', message: '', onConfirm: null });

  const handleSaveRecord = (dataArray) => {
    setIsLoading(true);
    setTimeout(() => {
      const recordsToSave = dataArray.map(({ tempId, ...rest }) => rest);
      let updatedRecords;

      if (editingRecord) {
        updatedRecords = records.map(r => r.id === editingRecord.id ? { ...r, ...recordsToSave[0] } : r);
      } else {
        updatedRecords = [...recordsToSave, ...records];
      }

      setRecords(updatedRecords);
      setEditingRecord(null);
      setActiveTab('list');
      showAlert('บันทึกข้อมูลเรียบร้อยแล้ว!');
      setIsLoading(false);
    }, 400);
  };

  const handleDeleteRecord = (id) => {
    showConfirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ประวัติจะถูกลบถาวร', () => {
      closeDialog();
      setIsLoading(true);
      setTimeout(() => {
        setRecords(records.filter(r => r.id !== id));
        setIsLoading(false);
      }, 300);
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
      <header className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Store size={26} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow-sm">บันทึกของหาย</h1>
              <p className="text-[10px] md:text-xs font-medium text-white/80 tracking-wide uppercase">ระบบจัดการสินค้าสูญหาย</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-3 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            <NavButton icon={<BarChart3 size={18}/>} label="สรุปยอด" isActive={activeTab === 'summary'} onClick={() => { setActiveTab('summary'); setEditingRecord(null); }} />
            <NavButton icon={<PlusCircle size={18}/>} label={editingRecord ? "แก้ไขบิล" : "บันทึกบิล"} isActive={activeTab === 'form'} onClick={() => setActiveTab('form')} />
            <NavButton icon={<List size={18}/>} label="ประวัติ" isActive={activeTab === 'list'} onClick={() => { setActiveTab('list'); setEditingRecord(null); }} />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-2 sm:p-3 md:p-6 mt-2 md:mt-4 relative w-full overflow-hidden">
        {(activeTab === 'summary' || activeTab === 'list') && (
          <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-4 sm:mb-6 md:mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-end transition-all">
            <div className="flex items-center gap-2 md:mb-2 text-violet-700 font-bold w-full md:w-auto">
              <div className="bg-violet-100 p-1.5 sm:p-2 rounded-xl text-violet-600"><Filter size={18} /></div>
              <span className="text-base sm:text-lg">ตัวกรอง</span>
            </div>
            
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="w-full sm:w-1/2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1 sm:mb-1.5 uppercase tracking-wide">ตั้งแต่วันที่</label>
                <input 
                  type="date" 
                  value={filterStartDate} 
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  min={minAllowedDate}
                  className="w-full p-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-xs font-semibold text-slate-700 transition-all"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1 sm:mb-1.5 uppercase tracking-wide">ถึงวันที่</label>
                <input 
                  type="date" 
                  value={filterEndDate} 
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  min={filterStartDate || minAllowedDate}
                  className="w-full p-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-xs font-semibold text-slate-700 transition-all"
                />
              </div>
            </div>

            <div className="w-full md:w-56">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1 sm:mb-1.5 uppercase tracking-wide">เลือกสาขา</label>
              <select 
                value={filterBranch} 
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full p-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <option value="ทั้งหมด">- แสดงทุกสาขา -</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterBranch('ทั้งหมด'); }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-[11px] sm:text-xs group"
            >
              <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" /> ล้างค่า
            </button>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative w-full">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="text-violet-600 animate-spin" />
                <p className="font-bold text-violet-800">กำลังดำเนินการ...</p>
              </div>
            </div>
          )}

          {activeTab === 'form' && <RecordForm onSubmit={handleSaveRecord} initialData={editingRecord} onCancel={handleCancelEdit} showAlert={showAlert} />}
          {activeTab === 'list' && <RecordList records={filteredRecords} filterBranch={filterBranch} onEdit={handleEditClick} onDelete={handleDeleteRecord} />}
          {activeTab === 'summary' && <SummaryDashboard filteredRecords={filteredRecords} filterStartDate={filterStartDate} filterEndDate={filterEndDate} filterBranch={filterBranch} />}
        </div>
      </main>

      {}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-safe rounded-t-3xl">
        <MobileNavButton icon={<BarChart3 size={22}/>} label="สรุปยอด" isActive={activeTab === 'summary'} onClick={() => { setActiveTab('summary'); setEditingRecord(null); }} />
        <MobileNavButton icon={<PlusCircle size={24}/>} label={editingRecord ? "แก้ไข" : "บันทึกบิล"} isActive={activeTab === 'form'} onClick={() => setActiveTab('form')} isPrimary={true} />
        <MobileNavButton icon={<List size={22}/>} label="ประวัติบิล" isActive={activeTab === 'list'} onClick={() => { setActiveTab('list'); setEditingRecord(null); }} />
      </nav>

      {}
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

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${isActive ? 'bg-white text-violet-700 shadow-md transform scale-105' : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'}`}>
      {icon} {label}
    </button>
  );
}

function MobileNavButton({ icon, label, isActive, onClick, isPrimary }) {
  if (isPrimary) {
    return (
      <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 min-w-[70px] -mt-6`}>
        <div className={`p-4 rounded-full shadow-lg text-white transition-transform transform ${isActive ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 scale-110 shadow-violet-500/40' : 'bg-slate-800 hover:scale-105'}`}>
          {icon}
        </div>
        <span className={`text-[10px] mt-1.5 font-bold ${isActive ? 'text-violet-700' : 'text-slate-600'}`}>{label}</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-2 min-w-[70px] transition-all duration-300 ${isActive ? 'text-violet-600 scale-110' : 'text-slate-400 hover:text-violet-500'}`}>
      <div className={`${isActive ? 'bg-violet-100 p-1.5 rounded-xl' : 'p-1.5'}`}>{icon}</div>
      <span className="text-[10px] mt-1 font-extrabold">{label}</span>
    </button>
  );
}

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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all">
        <div className={`p-3 sm:p-4 md:p-6 flex items-center justify-between gap-3 ${initialData ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-md">
              {initialData ? <Edit className="text-white w-5 h-5 sm:w-6 sm:h-6" /> : <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-wide drop-shadow-sm">
              {initialData ? 'แก้ไขบิล' : 'บันทึกบิลสินค้าสูญหาย'}
            </h2>
          </div>
          {initialData && (
            <button onClick={onCancel} className="text-white hover:bg-white/20 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-colors">
              <X size={14} /> ยกเลิก
            </button>
          )}
        </div>
        
        <div className="p-3 sm:p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 bg-white">
          <div>
            <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 uppercase"><User size={14} className="text-violet-500"/> พนักงาน</label>
            <input type="text" required name="reporterName" value={headerData.reporterName} onChange={handleHeaderChange} className="w-full p-2 sm:p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all text-xs sm:text-sm" placeholder="ระบุชื่อพนักงาน" />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 uppercase"><Calendar size={14} className="text-violet-500"/> วัน/เวลา</label>
            <input type="datetime-local" required name="dateTime" value={headerData.dateTime} onChange={handleHeaderChange} className="w-full p-2 sm:p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all text-xs sm:text-sm" />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-extrabold text-slate-700 mb-1.5 sm:mb-2 flex items-center gap-1.5 uppercase"><Store size={14} className="text-violet-500"/> สาขา</label>
            <select name="branch" value={headerData.branch} onChange={handleHeaderChange} className="w-full p-2 sm:p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all cursor-pointer text-xs sm:text-sm">
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all">
        <div className="bg-violet-50/50 p-3 sm:p-4 border-b border-violet-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-violet-100 p-1.5 sm:p-2 rounded-xl">
            <Package size={18} className="text-violet-600 sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-violet-900">เพิ่มรายการสินค้า</h3>
        </div>
        <form onSubmit={handleAddItem} className="p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-end">
            <div className="md:col-span-6">
              <label className="block text-[9px] sm:text-[10px] md:text-xs font-extrabold text-slate-500 mb-1 uppercase">ชื่อสินค้าที่หาย</label>
              <input type="text" name="productName" value={currentItem.productName} onChange={handleItemChange} className="w-full p-2 sm:p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 outline-none font-semibold text-slate-800 transition-all text-xs sm:text-sm" placeholder="เช่น นมสด 2L" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:col-span-6 md:grid-cols-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-[9px] sm:text-[10px] md:text-xs font-extrabold text-slate-500 mb-1 uppercase">จำนวน</label>
                <input type="number" min="1" step="1" name="quantity" value={currentItem.quantity} onChange={handleItemChange} className="w-full p-2 sm:p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 outline-none font-bold text-center text-slate-800 transition-all text-xs sm:text-sm" placeholder="0" />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[9px] sm:text-[10px] md:text-xs font-extrabold text-slate-500 mb-1 uppercase">ราคา/หน่วย</label>
                <div className="relative">
                  <span className="absolute left-2.5 sm:left-3 top-2 sm:top-2.5 text-slate-400 font-bold text-xs sm:text-sm">฿</span>
                  <input type="number" min="0" step="0.25" name="price" value={currentItem.price} onChange={handleItemChange} className="w-full pl-6 sm:pl-8 p-2 sm:p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-violet-500 outline-none font-bold text-slate-800 transition-all text-xs sm:text-sm" placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="md:col-span-12 mt-2 md:mt-0">
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-2.5 sm:py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-300 transform hover:-translate-y-0.5 text-xs sm:text-sm">
                <PlusCircle size={16}/> เพิ่มลงบิล
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden w-full">
        <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-slate-200 p-1.5 sm:p-2 rounded-xl text-slate-600"><List size={14} className="sm:w-4 sm:h-4"/></div>
            <h3 className="font-extrabold text-slate-800 text-[11px] sm:text-sm md:text-base">รายการสินค้าที่เพิ่มแล้ว <span className="text-violet-600 bg-violet-100 px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-xs ml-1 sm:ml-2">{billItems.length}</span></h3>
          </div>
        </div>
        
        {billItems.length === 0 ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center bg-slate-50/50">
            <div className="bg-slate-100 p-3 rounded-full mb-2 sm:mb-3"><Package size={24} className="text-slate-300 sm:w-8 sm:h-8" /></div>
            <p className="font-bold text-slate-400 text-[11px] sm:text-sm">ยังไม่มีรายการสินค้า</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[9px] sm:text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="p-2 sm:p-3 font-extrabold w-[40%]">สินค้า</th>
                  <th className="p-2 sm:p-3 font-extrabold text-center w-[15%]">จำนวน</th>
                  <th className="p-2 sm:p-3 font-extrabold text-right w-[25%]">ราคา</th>
                  <th className="p-2 sm:p-3 font-extrabold text-right w-[20%]">รวม</th>
                  <th className="p-2 sm:p-3 font-extrabold text-center w-8 sm:w-10">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billItems.map((item, index) => (
                  <tr key={item.tempId || index} className="hover:bg-violet-50/50 transition-colors group">
                    <td className="p-2 sm:p-3">
                      <p className="font-extrabold text-slate-800 text-[10px] sm:text-xs break-words whitespace-normal leading-tight">{item.productName}</p>
                    </td>
                    <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-50/50">{item.quantity}</td>
                    <td className="p-2 sm:p-3 text-right text-[9px] sm:text-[10px] md:text-xs font-semibold text-slate-500">{Number(item.price).toLocaleString()}</td>
                    <td className="p-2 sm:p-3 text-right text-[10px] sm:text-xs md:text-sm font-extrabold text-rose-600">฿{item.totalValue.toLocaleString()}</td>
                    <td className="p-1 sm:p-3 text-center">
                      <button onClick={() => handleRemoveItem(item.tempId)} className="text-slate-300 hover:text-rose-500 p-1 rounded transition-all" title="ลบรายการนี้">
                        <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                  <td colSpan={3} className="p-2 sm:p-3 md:p-4 text-right font-extrabold text-slate-600 text-[9px] sm:text-[10px] uppercase tracking-wide">ยอดรวม:</td>
                  <td className="p-2 sm:p-3 md:p-4 text-right font-black text-rose-500 text-[11px] sm:text-sm md:text-lg">
                    ฿{grandTotal.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmitBill}
        disabled={billItems.length === 0}
        className={`w-full font-black py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 flex justify-center items-center gap-2 text-sm sm:text-base md:text-lg ${
          billItems.length === 0 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : initialData 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transform hover:-translate-y-1' 
              : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 hover:from-violet-700 hover:via-fuchsia-700 hover:to-pink-600 text-white transform hover:-translate-y-1'
        }`}
      >
        {initialData ? <Check size={18} /> : <FileText size={18} />} 
        {initialData ? 'ยืนยันการแก้ไข' : 'บันทึกบิลนี้'}
      </button>
    </div>
  );
}

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
      <div className="text-center py-12 sm:py-16 bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center">
        <div className="bg-slate-50 p-4 sm:p-5 rounded-full mb-3 sm:mb-4">
          <Package size={32} className="text-slate-300 sm:w-10 sm:h-10" />
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-600">ไม่พบประวัติ</h3>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-3 sm:space-y-4 md:space-y-6">
      {displayBranches.map(branch => {
        const branchRecords = groupedByBranch[branch];
        if (branchRecords.length === 0) return null; 

        const branchTotalVal = branchRecords.reduce((sum, r) => sum + r.totalValue, 0);
        const isExpanded = expandedGroups[branch];

        return (
          <div key={branch} className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-md border border-slate-100 overflow-hidden w-full">
            <div 
              onClick={() => toggleGroup(branch)} 
              className={`p-2.5 sm:p-3 md:p-5 cursor-pointer flex items-center justify-between border-b ${isExpanded ? 'bg-violet-50/50 border-violet-100' : 'bg-white border-transparent'}`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${isExpanded ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Store size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[13px] sm:text-sm md:text-lg text-slate-800">{branch}</h3>
                  <span className="text-[8px] sm:text-[9px] font-bold text-violet-600 bg-violet-100 px-1.5 sm:px-2 py-0.5 rounded mt-0.5 inline-block">
                    {branchRecords.length} รายการ
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-right">
                  <p className="text-[8px] sm:text-[9px] font-bold text-slate-400">มูลค่ารวม</p>
                  <p className="font-black text-rose-600 text-[11px] sm:text-xs md:text-sm">฿{branchTotalVal.toLocaleString()}</p>
                </div>
                <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-violet-500' : 'text-slate-400'}`} size={14} />
              </div>
            </div>
            
            <div className={`transition-all duration-300 origin-top w-full ${isExpanded ? 'scale-y-100 opacity-100' : 'hidden'}`}>
              <div className="w-full">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider border-b border-slate-100">
                      <th className="p-1.5 sm:p-2 md:p-3 pl-2 sm:pl-3 md:pl-4 font-extrabold w-[40%] md:w-auto">รายการสินค้า</th>
                      <th className="p-1.5 sm:p-2 md:p-3 font-extrabold text-center w-[20%] md:w-auto">พนักงาน</th>
                      <th className="p-1.5 sm:p-2 md:p-3 font-extrabold text-center w-[15%] md:w-auto">จำนวน</th>
                      <th className="p-1.5 sm:p-2 md:p-3 font-extrabold text-right w-[25%] md:w-auto pr-2">มูลค่า</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {branchRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-1.5 sm:p-2 md:p-3 pl-2 sm:pl-3 md:pl-4 align-top">
                          <p className="font-extrabold text-slate-800 text-[10px] sm:text-[11px] md:text-sm break-words whitespace-normal leading-tight">{record.productName}</p>
                          <div className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5 flex flex-wrap gap-x-1">
                            <span>{new Date(record.dateTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                            <span>{new Date(record.dateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}น.</span>
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-2 md:p-3 text-center align-top">
                          <span className="font-semibold text-slate-600 text-[9px] sm:text-[10px] md:text-xs truncate block max-w-[50px] sm:max-w-full mx-auto">
                            {record.reporterName.split(' ')[0]}
                          </span>
                        </td>
                        <td className="p-1.5 sm:p-2 md:p-3 text-center align-top">
                          <span className="font-bold text-slate-700 text-[10px] sm:text-[11px] md:text-sm">{record.quantity}</span>
                        </td>
                        <td className="p-1.5 sm:p-2 md:p-3 text-right align-top pr-2">
                          <span className="font-black text-rose-600 text-[10px] sm:text-[11px] md:text-sm block">฿{record.totalValue.toLocaleString()}</span>
                          <div className="flex justify-end gap-1 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(record)} className="p-0.5 text-slate-300 hover:text-amber-500 rounded" title="แก้ไข">
                              <Edit size={10} className="sm:w-3 sm:h-3" />
                            </button>
                            <button onClick={() => onDelete(record.id)} className="p-0.5 text-slate-300 hover:text-rose-500 rounded" title="ลบ">
                              <Trash2 size={10} className="sm:w-3 sm:h-3" />
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

function SummaryDashboard({ filteredRecords, filterStartDate, filterEndDate, filterBranch }) {
  const displayDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (!filterStartDate && !filterEndDate) {
      dates.push(today);
    } else if (filterStartDate && !filterEndDate) {
      const d = new Date(filterStartDate);
      d.setHours(0,0,0,0);
      dates.push(d);
    } else if (!filterStartDate && filterEndDate) {
      const d = new Date(filterEndDate);
      d.setHours(0,0,0,0);
      dates.push(d);
    } else {
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

  const dashboardRecords = useMemo(() => {
    if(displayDates.length === 0) return [];
    const startStr = getLocalDateString(displayDates[0]);
    const endStr = getLocalDateString(displayDates[displayDates.length - 1]);
    
    return filteredRecords.filter(r => {
      const rDateStr = r.dateTime.split('T')[0];
      return rDateStr >= startStr && rDateStr <= endStr;
    });
  }, [filteredRecords, displayDates]);

  const displayBranches = filterBranch === 'ทั้งหมด' ? BRANCHES : [filterBranch];

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
      quantity: branchRecords.reduce((sum, r) => sum + r.quantity, 0),
      value: branchRecords.reduce((sum, r) => sum + r.totalValue, 0),
      itemsList: itemsList
    };
  }).sort((a, b) => b.value - a.value);

  const grandTotalQuantity = dashboardRecords.reduce((sum, r) => sum + r.quantity, 0);
  const grandTotalValue = dashboardRecords.reduce((sum, r) => sum + r.totalValue, 0);

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden w-full">
        <div className="bg-gradient-to-br from-emerald-50 to-white p-3 sm:p-4 border-b border-emerald-100 flex items-center gap-2 sm:gap-3">
          <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-xl text-emerald-600 shadow-inner">
            <Store size={16} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm md:text-lg font-black text-emerald-900 tracking-tight">สรุปจำนวนชิ้นสินค้าที่สูญหาย</h3>
          </div>
        </div>
        
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-white text-slate-400 text-[8px] sm:text-[9px] md:text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-2 sm:p-3 md:p-4 font-extrabold w-[25%]">สาขา</th>
                <th className="p-2 sm:p-3 md:p-4 font-extrabold w-[45%]">รายละเอียด</th>
                <th className="p-2 sm:p-3 md:p-4 font-extrabold text-center bg-slate-50 w-[15%]">ชิ้น</th>
                <th className="p-2 sm:p-3 md:p-4 font-extrabold text-right bg-slate-50 w-[15%] pr-3">มูลค่า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {branchSummaries.map((branch) => (
                <tr key={branch.name} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-2 sm:p-3 md:p-4 font-extrabold text-slate-800 text-[9px] sm:text-[10px] md:text-sm align-top break-words">
                    <div className="flex items-center gap-1 md:gap-2">
                      {branch.value > 0 && <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 shrink-0 hidden sm:block"></span>}
                      {branch.name}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 align-top">
                    {branch.itemsList.length > 0 ? (
                      <div className="flex flex-wrap gap-0.5 sm:gap-1">
                        {branch.itemsList.map((item, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 font-bold text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-1.5 py-0.5 rounded border border-slate-200 break-words whitespace-normal inline-block leading-tight">
                            {item.name} <span className="text-slate-400">({item.qty})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-[8px] sm:text-[10px] md:text-xs">-</span>
                    )}
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 text-center bg-slate-50/50 align-top">
                    <span className="font-black text-slate-700 text-[9px] sm:text-[10px] md:text-sm">
                      {branch.quantity > 0 ? branch.quantity.toLocaleString() : '-'}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 text-right bg-slate-50/50 align-top pr-3">
                    <span className={`font-black text-[9px] sm:text-[10px] md:text-sm ${branch.value > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                      {branch.value > 0 ? `฿${branch.value.toLocaleString()}` : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                <td className="p-2 sm:p-3 md:p-5 font-extrabold text-slate-600 text-right uppercase text-[8px] sm:text-[9px] md:text-xs" colSpan={2}>รวมทั้งหมด:</td>
                <td className="p-2 sm:p-3 md:p-5 text-center font-black text-slate-800 text-[10px] sm:text-[11px] md:text-base">{grandTotalQuantity.toLocaleString()}</td>
                <td className="p-2 sm:p-3 md:p-5 text-right font-black text-rose-500 text-[10px] sm:text-[11px] md:text-base pr-3">฿{grandTotalValue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}