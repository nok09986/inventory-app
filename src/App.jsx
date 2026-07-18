import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, Package, Calendar, User, 
  ChevronDown, PlusCircle, List, 
  BarChart3, FileText, Filter, RotateCcw, 
  Edit, Trash2, X, AlertCircle, Check, Info, Loader2
} from 'lucide-react';
import { supabase } from './supabaseClient'; // นำเข้าตัวเชื่อมต่อ Database

const BRANCHES = ['สาขา 1', 'สาขา 2', 'สาขา 3', 'สาขา 4', 'สาขา 5', 'ร้านของชำ'];

export default function App() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState('summary'); 
  
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterBranch, setFilterBranch] = useState('ทั้งหมด');

  const [editingRecord, setEditingRecord] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, type: '', message: '', onConfirm: null });

  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, onConfirmCallback) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm: onConfirmCallback });
  const closeDialog = () => setDialog({ isOpen: false, type: '', message: '', onConfirm: null });

  // 1. ดึงข้อมูลจาก Database ตอนเปิดหน้าเว็บ
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .order('dateTime', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching:', error.message);
      showAlert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. บันทึกข้อมูลลง Database
  const handleSaveRecord = async (dataArray) => {
    setIsLoading(true);
    try {
      // ตัด tempId ทิ้งก่อนบันทึก
      const recordsToSave = dataArray.map(({ id, tempId, ...rest }) => rest);

      if (editingRecord) {
        const { error } = await supabase
          .from('records')
          .update(recordsToSave[0])
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('records')
          .insert(recordsToSave);
        if (error) throw error;
      }

      await fetchRecords(); 
      setEditingRecord(null);
      setActiveTab('list');
      showAlert('บันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว! 🎉');
    } catch (error) {
      console.error('Error saving:', error.message);
      showAlert('บันทึกไม่สำเร็จ: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. ลบข้อมูลจาก Database
  const handleDeleteRecord = (id) => {
    showConfirm('แน่ใจหรือไม่ว่าต้องการลบ? ข้อมูลจะหายไปจากฐานข้อมูลถาวร', async () => {
      closeDialog();
      setIsLoading(true);
      try {
        const { error } = await supabase.from('records').delete().eq('id', id);
        if (error) throw error;
        await fetchRecords(); 
      } catch (error) {
        showAlert('ลบข้อมูลไม่สำเร็จ: ' + error.message);
      } finally {
        setIsLoading(false);
      }
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

      <main className="max-w-6xl mx-auto p-3 md:p-6 mt-2 md:mt-4 relative">
        {(activeTab === 'summary' || activeTab === 'list') && (
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-6 md:mb-8 flex flex-col md:flex-row gap-4 items-start md:items-end transition-all">
            <div className="flex items-center gap-2 md:mb-2 text-violet-700 font-bold w-full md:w-auto">
              <div className="bg-violet-100 p-2 rounded-xl text-violet-600"><Filter size={20} /></div>
              <span className="text-lg">ตัวกรอง</span>
            </div>
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">ตั้งแต่วันที่</label>
                <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} min={minAllowedDate} className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 outline-none text-sm font-semibold transition-all" />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">ถึงวันที่</label>
                <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} min={filterStartDate || minAllowedDate} className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/20 outline-none text-sm font-semibold transition-all" />
              </div>
            </div>
            <div className="w-full md:w-56">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">เลือกสาขา</label>
              <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white outline-none text-sm font-semibold transition-all cursor-pointer">
                <option value="ทั้งหมด">- แสดงทุกสาขา -</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterBranch('ทั้งหมด'); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm group">
              <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" /> ล้างค่า
            </button>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="text-violet-600 animate-spin" />
                <p className="font-bold text-violet-800">กำลังซิงค์ข้อมูลกับฐานข้อมูล...</p>
              </div>
            </div>
          )}

          {activeTab === 'form' && <RecordForm onSubmit={handleSaveRecord} initialData={editingRecord} onCancel={handleCancelEdit} showAlert={showAlert} />}
          {activeTab === 'list' && <RecordList records={filteredRecords} filterBranch={filterBranch} onEdit={handleEditClick} onDelete={handleDeleteRecord} />}
          {activeTab === 'summary' && <SummaryDashboard filteredRecords={filteredRecords} filterStartDate={filterStartDate} filterEndDate={filterEndDate} filterBranch={filterBranch} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-40 pb-safe rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <MobileNavButton icon={<BarChart3 size={24}/>} label="สรุปยอด" isActive={activeTab === 'summary'} onClick={() => { setActiveTab('summary'); setEditingRecord(null); }} />
        <MobileNavButton icon={<PlusCircle size={24}/>} label={editingRecord ? "แก้ไข" : "บันทึกบิล"} isActive={activeTab === 'form'} onClick={() => setActiveTab('form')} isPrimary={true} />
        <MobileNavButton icon={<List size={24}/>} label="ประวัติบิล" isActive={activeTab === 'list'} onClick={() => { setActiveTab('list'); setEditingRecord(null); }} />
      </nav>

      {/* Custom Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-4 ${dialog.type === 'confirm' ? 'bg-rose-50' : 'bg-indigo-50'} flex items-start gap-3`}>
              <div className={`p-2 rounded-full ${dialog.type === 'confirm' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {dialog.type === 'confirm' ? <AlertCircle size={24} /> : <Info size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{dialog.type === 'confirm' ? 'ยืนยันการดำเนินการ' : 'แจ้งเตือน'}</h3>
                <p className="text-slate-600 text-sm mt-1">{dialog.message}</p>
              </div>
            </div>
            <div className="p-4 flex gap-3 justify-end bg-slate-50 border-t border-slate-100">
              {dialog.type === 'confirm' && (
                <button onClick={closeDialog} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">ยกเลิก</button>
              )}
              <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); else closeDialog(); }} className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors ${dialog.type === 'confirm' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
                {dialog.type === 'confirm' ? 'ยืนยัน' : 'ตกลง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) { return ( <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${isActive ? 'bg-white text-violet-700 shadow-md transform scale-105' : 'text-white/90 hover:bg-white/20 hover:text-white hover:scale-105'}`}>{icon} {label}</button> ); }
function MobileNavButton({ icon, label, isActive, onClick, isPrimary }) { if (isPrimary) { return ( <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 min-w-[70px] -mt-6`}><div className={`p-4 rounded-full shadow-lg text-white transition-transform transform ${isActive ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 scale-110 shadow-violet-500/40' : 'bg-slate-800 hover:scale-105'}`}>{icon}</div><span className={`text-[11px] mt-1.5 font-bold ${isActive ? 'text-violet-700' : 'text-slate-600'}`}>{label}</span></button> ); } return ( <button onClick={onClick} className={`flex flex-col items-center p-2 min-w-[70px] transition-all duration-300 ${isActive ? 'text-violet-600 scale-110' : 'text-slate-400 hover:text-violet-500'}`}><div className={`${isActive ? 'bg-violet-100 p-1.5 rounded-xl' : 'p-1.5'}`}>{icon}</div><span className="text-[11px] mt-1 font-extrabold">{label}</span></button> ); }

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
    if (!currentItem.productName || !currentItem.quantity || !currentItem.price) { showAlert('กรุณากรอกข้อมูลสินค้าให้ครบถ้วนก่อนเพิ่มลงบิล'); return; }
    const qty = parseFloat(currentItem.quantity); const prc = parseFloat(currentItem.price);
    setBillItems([...billItems, { ...currentItem, quantity: qty, price: prc, totalValue: qty * prc, tempId: Date.now() }]);
    setCurrentItem({ productName: '', quantity: '', price: '' });
  };
  const handleRemoveItem = (tempId) => setBillItems(billItems.filter(item => item.tempId !== tempId));
  const handleSubmitBill = () => {
    if (!headerData.reporterName) return showAlert('กรุณาระบุชื่อพนักงานผู้บันทึก');
    if (billItems.length === 0) return showAlert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
    const finalRecords = billItems.map(item => ({
      reporterName: headerData.reporterName, dateTime: headerData.dateTime, branch: headerData.branch,
      productName: item.productName, quantity: item.quantity, price: item.price, totalValue: item.totalValue
    }));
    onSubmit(finalRecords);
  };
  const grandTotal = billItems.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className={`p-4 md:p-6 flex items-center justify-between gap-3 ${initialData ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'}`}>
          <div className="flex items-center gap-3"><div className="bg-white/20 p-2 md:p-2.5 rounded-xl backdrop-blur-md">{initialData ? <Edit className="text-white" size={24} /> : <FileText className="text-white" size={24} />}</div><h2 className="text-xl md:text-2xl font-extrabold text-white">{initialData ? 'แก้ไขประวัติบันทึกบิล' : 'บันทึกบิลสินค้าสูญหาย/ชำรุด'}</h2></div>
          {initialData && <button onClick={onCancel} className="text-white hover:bg-white/20 flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3 py-2 rounded-xl"><X size={18} /> ยกเลิก</button>}
        </div>
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div><label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase">พนักงานผู้บันทึก</label><input type="text" required name="reporterName" value={headerData.reporterName} onChange={handleHeaderChange} className="w-full p-2.5 bg-slate-50 border-2 rounded-xl outline-none" placeholder="ระบุชื่อพนักงาน" /></div>
          <div><label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase">วันที่และเวลาเกิดเหตุ</label><input type="datetime-local" required name="dateTime" value={headerData.dateTime} onChange={handleHeaderChange} className="w-full p-2.5 bg-slate-50 border-2 rounded-xl outline-none" /></div>
          <div><label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase">สาขาที่เกิดเหตุ</label><select name="branch" value={headerData.branch} onChange={handleHeaderChange} className="w-full p-2.5 bg-slate-50 border-2 rounded-xl outline-none cursor-pointer">{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-violet-50/50 p-4 border-b border-violet-100 flex items-center gap-3"><div className="bg-violet-100 p-2 rounded-xl"><Package size={22} className="text-violet-600" /></div><h3 className="font-extrabold text-violet-900">เพิ่มรายการสินค้าลงในบิล</h3></div>
        <form onSubmit={handleAddItem} className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6"><label className="block text-xs font-extrabold text-slate-500 mb-2">ชื่อรายการที่หาย</label><input type="text" name="productName" value={currentItem.productName} onChange={handleItemChange} className="w-full p-2.5 bg-slate-50 border-2 rounded-xl outline-none" placeholder="เช่น นมสด 2L" /></div>
            <div className="grid grid-cols-2 gap-4 md:col-span-6 md:grid-cols-6 items-end">
              <div className="md:col-span-2"><label className="block text-xs font-extrabold text-slate-500 mb-2">จำนวน</label><input type="number" min="1" step="1" name="quantity" value={currentItem.quantity} onChange={handleItemChange} className="w-full p-2.5 bg-slate-50 border-2 rounded-xl outline-none text-center" placeholder="0" /></div>
              <div className="md:col-span-4"><label className="block text-xs font-extrabold text-slate-500 mb-2">ราคา/หน่วย</label><div className="relative"><span className="absolute left-3 top-3 text-slate-400 font-bold">฿</span><input type="number" min="0" step="0.25" name="price" value={currentItem.price} onChange={handleItemChange} className="w-full pl-8 p-2.5 bg-slate-50 border-2 rounded-xl outline-none" placeholder="0.00" /></div></div>
            </div>
            <div className="md:col-span-12 mt-2 md:mt-0"><button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2"><PlusCircle size={20}/> เพิ่มลงรายการด้านล่าง</button></div>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center"><div className="flex items-center gap-3"><div className="bg-slate-200 p-2 rounded-xl text-slate-600"><List size={18}/></div><h3 className="font-extrabold text-slate-800">รายการสินค้าที่เพิ่มแล้ว <span className="text-violet-600 bg-violet-100 px-2 py-0.5 rounded-lg text-sm ml-2">{billItems.length}</span></h3></div></div>
        {billItems.length === 0 ? ( <div className="p-8 text-center flex flex-col items-center bg-slate-50/50"><div className="bg-slate-100 p-4 rounded-full mb-4"><Package size={40} className="text-slate-300" /></div><p className="font-bold text-slate-400">ยังไม่มีรายการสินค้า</p></div> ) : (
          <div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[500px]">
            <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200"><th className="p-3 font-extrabold">รายการสินค้า</th><th className="p-3 font-extrabold text-center">จำนวน</th><th className="p-3 font-extrabold text-right">ราคา/หน่วย</th><th className="p-3 font-extrabold text-right">ยอดรวม</th><th className="p-3 font-extrabold text-center">ลบ</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{billItems.map((item) => (
              <tr key={item.tempId} className="hover:bg-violet-50/50"><td className="p-3"><p className="font-extrabold text-slate-800">{item.productName}</p></td><td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td><td className="p-3 text-right font-semibold text-slate-500">{Number(item.price).toLocaleString()}</td><td className="p-3 text-right font-extrabold text-rose-600">฿{item.totalValue.toLocaleString()}</td><td className="p-3 text-center"><button onClick={() => handleRemoveItem(item.tempId)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button></td></tr>
            ))}</tbody>
            <tfoot><tr className="bg-slate-50 border-t-2 border-slate-200"><td colSpan={3} className="p-4 text-right font-extrabold text-slate-600">ยอดรวมทั้งบิล:</td><td className="p-4 text-right font-black text-rose-500 text-xl">฿{grandTotal.toLocaleString()}</td><td></td></tr></tfoot>
          </table></div>
        )}
      </div>
      <button onClick={handleSubmitBill} disabled={billItems.length === 0} className={`w-full font-black py-4 px-6 rounded-2xl shadow-xl flex justify-center items-center gap-2 text-lg ${billItems.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:from-violet-700 hover:to-pink-600'}`}>
        <Check size={24} /> ยืนยันการบันทึกเข้าระบบ Database
      </button>
    </div>
  );
}

function RecordList({ records, filterBranch, onEdit, onDelete }) {
  const displayBranches = filterBranch === 'ทั้งหมด' ? BRANCHES : [filterBranch];
  const groupedByBranch = useMemo(() => {
    return displayBranches.reduce((acc, branch) => { acc[branch] = records.filter(r => r.branch === branch); return acc; }, {});
  }, [records, displayBranches]);
  const [expandedGroups, setExpandedGroups] = useState(BRANCHES.reduce((acc, branch) => ({ ...acc, [branch]: true }), {}));
  const toggleGroup = (branch) => setExpandedGroups(prev => ({ ...prev, [branch]: !prev[branch] }));

  if (records.length === 0) return <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center"><Package size={48} className="text-slate-300 mb-4" /><h3 className="text-xl font-extrabold text-slate-600">ไม่พบประวัติบันทึก</h3></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {displayBranches.map(branch => {
        const branchRecords = groupedByBranch[branch];
        if (branchRecords.length === 0) return null; 
        const isExpanded = expandedGroups[branch];
        return (
          <div key={branch} className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <div onClick={() => toggleGroup(branch)} className="p-4 cursor-pointer flex items-center justify-between border-b bg-slate-50 hover:bg-slate-100">
              <div className="flex items-center gap-3"><Store size={20} className="text-violet-600" /><div><h3 className="font-extrabold text-lg text-slate-800">{branch}</h3><span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-lg">{branchRecords.length} รายการ</span></div></div>
              <ChevronDown className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={20} />
            </div>
            {isExpanded && (
              <div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[600px]">
                <thead><tr className="bg-white text-slate-400 text-xs uppercase border-b border-slate-100"><th className="p-4 font-extrabold">วัน/เวลา</th><th className="p-4 font-extrabold">รายการสินค้า</th><th className="p-4 font-extrabold">พนักงาน</th><th className="p-4 font-extrabold text-center">จำนวน</th><th className="p-4 font-extrabold text-right">มูลค่ารวม</th><th className="p-4 font-extrabold text-center">จัดการ</th></tr></thead>
                <tbody className="divide-y divide-slate-50">{branchRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50"><td className="p-4 text-sm font-bold text-slate-700">{new Date(record.dateTime).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</td><td className="p-4 font-extrabold text-slate-800">{record.productName}</td><td className="p-4 text-xs font-semibold text-slate-600"><User size={12} className="inline text-violet-400"/> {record.reporterName}</td><td className="p-4 text-center font-bold text-slate-700">{record.quantity}</td><td className="p-4 text-right font-black text-rose-600">฿{record.totalValue.toLocaleString()}</td><td className="p-4 text-center"><button onClick={() => onDelete(record.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button></td></tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SummaryDashboard({ filteredRecords, filterStartDate, filterEndDate, filterBranch }) {
  const displayBranches = filterBranch === 'ทั้งหมด' ? BRANCHES : [filterBranch];
  const branchSummaries = displayBranches.map(branch => {
    const branchRecords = filteredRecords.filter(r => r.branch === branch);
    return { name: branch, quantity: branchRecords.reduce((sum, r) => sum + r.quantity, 0), value: branchRecords.reduce((sum, r) => sum + r.totalValue, 0) };
  }).sort((a, b) => b.value - a.value);
  const grandTotalQuantity = branchSummaries.reduce((sum, b) => sum + b.quantity, 0);
  const grandTotalValue = branchSummaries.reduce((sum, b) => sum + b.value, 0);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="bg-emerald-50 p-6 border-b border-emerald-100"><h3 className="text-xl font-black text-emerald-900">สรุปจำนวนชิ้นสินค้าที่สูญหาย (Database)</h3></div>
      <div className="overflow-x-auto"><table className="w-full text-left min-w-[500px]">
        <thead><tr className="bg-white text-slate-400 text-xs uppercase border-b border-slate-100"><th className="p-5 font-extrabold">สาขา</th><th className="p-5 font-extrabold text-center bg-slate-50">รวมชิ้น</th><th className="p-5 font-extrabold text-right bg-slate-50">มูลค่ารวม (บาท)</th></tr></thead>
        <tbody className="divide-y divide-slate-50">{branchSummaries.map((branch) => (
          <tr key={branch.name} className="hover:bg-emerald-50/30"><td className="p-5 font-extrabold text-slate-800">{branch.name}</td><td className="p-5 text-center bg-slate-50/50 font-black text-slate-700">{branch.quantity > 0 ? branch.quantity.toLocaleString() : '-'}</td><td className="p-5 text-right bg-slate-50/50 font-black text-rose-600">{branch.value > 0 ? `฿${branch.value.toLocaleString()}` : '-'}</td></tr>
        ))}
        {branchSummaries.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-400">ไม่พบรายการ</td></tr>}</tbody>
        <tfoot><tr className="bg-slate-50 border-t-2 border-slate-200"><td className="p-6 font-extrabold text-slate-600 text-right uppercase">ยอดสรุปรวมทั้งหมด:</td><td className="p-6 text-center font-black text-slate-800 text-xl">{grandTotalQuantity.toLocaleString()}</td><td className="p-6 text-right font-black text-rose-500 text-2xl">฿{grandTotalValue.toLocaleString()}</td></tr></tfoot>
      </table></div>
    </div>
  );
}