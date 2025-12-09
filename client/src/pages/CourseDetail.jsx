import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Calendar, Upload, X, FileText, 
  Link as LinkIcon, Download, FolderOpen, 
  Users, MessageSquare, Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import CourseChat from '../components/CourseChat';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Data States
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments', 'resources', 'members', 'discussion'
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [error, setError] = useState('');

  // Forms
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Normal'
  });

  const [submitForm, setSubmitForm] = useState({
    fileUrl: '',
    comment: '',
    file: null
  });

  const [resourceForm, setResourceForm] = useState({
    title: '',
    fileUrl: '',
    type: 'file' // or 'link'
  });

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      // Fetch Course + Assignments + Resources in parallel
      const [courseRes, resourceRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/resources`).catch(() => ({ data: [] })) // Handle if route doesn't exist yet
      ]);
      
      setCourse(courseRes.data.course);
      setAssignments(courseRes.data.assignments);
      setResources(resourceRes.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- ASSIGNMENT HANDLERS ---
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/assignments', { ...assignmentForm, course: id });
      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', dueDate: '', priority: 'Normal' });
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating assignment');
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.fileUrl;
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let fileUrl = submitForm.fileUrl;
      if (submitForm.file) {
        fileUrl = await handleFileUpload(submitForm.file);
      }
      if (!fileUrl) {
        setError('Please provide a file or URL');
        return;
      }
      await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        fileUrl,
        comment: submitForm.comment
      });
      setShowSubmitModal(false);
      setSubmitForm({ fileUrl: '', comment: '', file: null });
      setSelectedAssignment(null);
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting assignment');
    }
  };

  // --- RESOURCE HANDLERS ---
  const handleAddResource = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/courses/${id}/resources`, resourceForm);
      setShowResourceModal(false);
      setResourceForm({ title: '', fileUrl: '', type: 'file' });
      fetchCourseDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding resource');
    }
  };

  // --- HELPERS ---
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100';
      case 'Normal': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-stone-50 text-stone-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Graded': return 'bg-emerald-100 text-emerald-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  const isInstructor = user?.role === 'instructor' || course?.owner._id === user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-700"></div>
      </div>
    );
  }

  if (!course) return <div className="text-center py-12">Course not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- COURSE HEADER --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider rounded-full">
                {course.code}
              </span>
              <span className="text-stone-500 text-sm flex items-center">
                <Users className="w-4 h-4 mr-1" /> {course.members.length} Members
              </span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-brand-900 mb-3">{course.title}</h1>
            <p className="text-stone-600 max-w-2xl leading-relaxed">{course.description}</p>
            
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex -space-x-2">
                {course.members.slice(0, 5).map((m, i) => (
                   <div key={i} className="w-8 h-8 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center text-xs font-bold text-brand-800">
                     {m.name.charAt(0)}
                   </div>
                ))}
                {course.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-xs font-medium text-stone-500">
                    +{course.members.length - 5}
                  </div>
                )}
              </div>
              <span className="text-sm text-stone-500">
                Instructor: <span className="font-semibold text-stone-800">{course.owner.name}</span>
              </span>
            </div>
          </div>

          {isInstructor && activeTab === 'assignments' && (
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-5 py-2.5 bg-brand-700 text-white rounded-lg hover:bg-brand-800 transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>New Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex space-x-8 border-b border-stone-200 mb-8">
        {['assignments', 'resources', 'members', 'discussion'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-semibold uppercase tracking-wide transition-all border-b-2 ${
              activeTab === tab
                ? 'border-brand-600 text-brand-800'
                : 'border-transparent text-stone-500 hover:text-brand-600 hover:border-brand-200'
            }`}
          >
            {tab === 'resources' ? 'Materials' : tab}
          </button>
        ))}
      </div>

      {/* --- TAB CONTENT --- */}
      <div className="min-h-[400px]">
        
        {/* 1. ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {assignments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-stone-300">
                <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">No assignments yet</h3>
                <p className="text-stone-500">Check back later for new tasks.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assignments.map(assignment => {
                   const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'Pending';
                   return (
                    <div key={assignment._id} className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-stone-900 group-hover:text-brand-700 transition-colors">
                            {assignment.title}
                          </h3>
                          {assignment.description && <p className="text-stone-600 mt-1 text-sm">{assignment.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider border ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                          <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className={`flex items-center space-x-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-stone-500'}`}>
                            <Calendar className="w-4 h-4" />
                            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy • h:mm a')}</span>
                          </div>
                          {isOverdue && <span className="text-red-600 text-xs font-bold uppercase bg-red-50 px-2 py-0.5 rounded">Overdue</span>}
                        </div>

                        {assignment.status !== 'Graded' && (
                          <button
                            onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }}
                            className="flex items-center space-x-2 text-sm font-medium text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{assignment.status === 'Submitted' ? 'Resubmit' : 'Submit Work'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. RESOURCES TAB (LECTURE MATERIALS) */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-stone-800">Lecture Notes & Materials</h3>
                {isInstructor && (
                  <button 
                    onClick={() => setShowResourceModal(true)}
                    className="text-sm bg-stone-800 hover:bg-black text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Material
                  </button>
                )}
             </div>

             {resources.length === 0 ? (
               <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                 <FolderOpen className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                 <p className="text-stone-500">No materials uploaded yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {resources.map(res => (
                   <div key={res._id} className="bg-white p-5 rounded-xl border border-stone-200 flex items-center justify-between hover:border-brand-300 hover:shadow-sm transition group">
                     <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                         {res.type === 'link' ? <LinkIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                       </div>
                       <div>
                         <h4 className="font-bold text-stone-800">{res.title}</h4>
                         <p className="text-xs text-stone-500 uppercase tracking-wide mt-0.5">
                           Added {format(new Date(res.createdAt), 'MMM d')}
                         </p>
                       </div>
                     </div>
                     <a 
                       href={res.fileUrl} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="p-2 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition"
                       title="Download / Open"
                     >
                       <Download className="w-5 h-5" />
                     </a>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* 3. MEMBERS TAB */}
        {activeTab === 'members' && (
           <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
             <div className="p-4 bg-stone-50 border-b border-stone-200 font-serif font-bold text-stone-700">
               Class Roster ({course.members.length})
             </div>
             <div className="divide-y divide-stone-100">
               {course.members.map(member => (
                 <div key={member._id} className="p-4 flex items-center space-x-4 hover:bg-stone-50 transition">
                   <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-amber-100 rounded-full flex items-center justify-center text-brand-900 font-bold font-serif">
                      {member.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-stone-900">{member.name}</p>
                     <p className="text-sm text-stone-500">{member.email}</p>
                   </div>
                   {course.owner._id === member._id && (
                     <span className="ml-auto text-xs bg-stone-800 text-white px-2 py-1 rounded">Instructor</span>
                   )}
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* 4. DISCUSSION TAB */}
        {activeTab === 'discussion' && (
          <CourseChat courseId={id} />
        )}

      </div>

      {/* --- MODALS --- */}
      
      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button onClick={() => setShowAssignmentModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Create Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Title</label>
                <input type="text" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Description</label>
                <textarea rows="3" value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Due Date</label>
                  <input type="datetime-local" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Priority</label>
                  <select value={assignmentForm.priority} onChange={e => setAssignmentForm({...assignmentForm, priority: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none">
                    <option>Low</option><option>Normal</option><option>High</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-700 text-white py-3 rounded-lg font-bold hover:bg-brand-800 transition">Create Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button onClick={() => setShowResourceModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Add Material</h2>
            <form onSubmit={handleAddResource} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Title</label>
                <input type="text" placeholder="e.g., Week 1 Slides" value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Resource Type</label>
                <select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none">
                  <option value="file">File (PDF/Doc/Image)</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                   {resourceForm.type === 'link' ? 'URL' : 'File URL (Upload via API)'}
                </label>
                <input type="text" placeholder="https://..." value={resourceForm.fileUrl} onChange={e => setResourceForm({...resourceForm, fileUrl: e.target.value})} required className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                {resourceForm.type === 'file' && <p className="text-xs text-stone-400 mt-1">Note: For this demo, please paste a hosted file link or implement file upload logic.</p>}
              </div>
              <button type="submit" className="w-full bg-stone-800 text-white py-3 rounded-lg font-bold hover:bg-black transition">Add Resource</button>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button onClick={() => setShowSubmitModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Submit Assignment</h2>
            <form onSubmit={handleSubmitAssignment} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Upload File</label>
                <input type="file" onChange={e => setSubmitForm({...submitForm, file: e.target.files[0]})} className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
              </div>
              <div className="text-center text-stone-400 font-serif italic">- OR -</div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">External Link</label>
                <input type="text" placeholder="https://google.drive/..." value={submitForm.fileUrl} onChange={e => setSubmitForm({...submitForm, fileUrl: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Comments</label>
                <textarea rows="3" value={submitForm.comment} onChange={e => setSubmitForm({...submitForm, comment: e.target.value})} className="w-full px-4 py-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-brand-700 text-white py-3 rounded-lg font-bold hover:bg-brand-800 transition">Submit Work</button>
            </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default CourseDetail;
