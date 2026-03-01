import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './Toast';

const FALLBACK_DOCS = [
    { id: '1', name: 'CSD Registration Report', description: 'Central Supplier Database summary report', requiredFor: ['SME', 'SUPPLIER'] },
    { id: '2', name: 'Valid Tax Clearance', description: 'SARS Tax Clearance Certificate with PIN', requiredFor: ['SME', 'SUPPLIER'] },
    { id: '3', name: '6 Months Bank Statements', description: 'Recent bank statements for affordability assessment', requiredFor: ['SME'] },
    { id: '4', name: 'Directors ID Copies', description: 'Certified copies of all active directors', requiredFor: ['SME', 'SUPPLIER'] }
];

export default function Vault({ user, onBack }) {
    const [docTypes, setDocTypes] = useState(FALLBACK_DOCS);
    const [documents, setDocuments] = useState({});
    const [uploading, setUploading] = useState({});
    const [progress, setProgress] = useState({});
    const toast = useToast();

    useEffect(() => {
        // Fetch real-time system document configuration
        const unsub = onSnapshot(doc(db, "system_config", "doctypes"), (docSnap) => {
            if (docSnap.exists()) {
                setDocTypes(docSnap.data().data || FALLBACK_DOCS);
            }
        });

        fetchUserDocuments();
        return () => unsub();
    }, []);

    const fetchUserDocuments = async () => {
        try {
            const q = query(collection(db, "user_documents"), where("uid", "==", user.id));
            const querySnapshot = await getDocs(q);
            const userDocs = {};
            querySnapshot.forEach((d) => {
                userDocs[d.data().docTypeId] = d.data();
            });
            setDocuments(userDocs);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const handleUpload = (docId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure we use string for docId as stored in Firestore
        const docIdStr = String(docId);

        const timestamp = Date.now();
        const filePath = `userData/${user.id}/documents/${docIdStr}_${timestamp}_${file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setUploading(prev => ({ ...prev, [docIdStr]: true }));
        setProgress(prev => ({ ...prev, [docIdStr]: 0 }));

        uploadTask.on('state_changed',
            (snapshot) => {
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgress(prev => ({ ...prev, [docIdStr]: prog }));
            },
            (error) => {
                console.error("Upload error:", error);
                setUploading(prev => ({ ...prev, [docIdStr]: false }));
                toast.error(`Upload failed: ${error.message}`);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const docData = {
                    uid: user.id,
                    docTypeId: docIdStr,
                    url: downloadURL,
                    storagePath: storageRef.fullPath,
                    uploadedAt: new Date().toISOString()
                };

                // Use the same composite ID as original app.js logic to prevent duplicates
                await setDoc(doc(db, "user_documents", `${user.id}_${docIdStr}`), docData);

                setDocuments(prev => ({ ...prev, [docIdStr]: docData }));
                setUploading(prev => ({ ...prev, [docIdStr]: false }));
                setProgress(prev => {
                    const next = { ...prev };
                    delete next[docIdStr];
                    return next;
                });
            }
        );
    };

    const handleDelete = async (docId, storagePath) => {
        if (!confirm("Are you sure you want to permanently delete this document?")) return;

        const docIdStr = String(docId);
        try {
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
            await deleteDoc(doc(db, "user_documents", `${user.id}_${docIdStr}`));

            setDocuments(prev => {
                const next = { ...prev };
                delete next[docIdStr];
                return next;
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast.error('Failed to delete document. It may have already been removed.');
        }
    };

    const requiredDocs = docTypes.filter(d => d.requiredFor.includes(user.type));
    const uploadedCount = requiredDocs.filter(d => documents[String(d.id)]).length;
    const totalCount = requiredDocs.length;
    const overallProgress = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 100;

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in mb-20">
            <button
                onClick={onBack}
                className="mb-10 flex items-center gap-2 group text-sm font-bold text-gray-500 hover:text-blue-600 transition-all"
            >
                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
            </button>

            <header className="mb-12">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Secure Document Vault</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                            Upload and manage your required compliance documents. These are protected with bank-grade encryption and only shared with verified funders during active deals.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono leading-none">{overallProgress}%</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Overall Compliance</div>
                    </div>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        style={{ width: `${overallProgress}%` }}
                    ></div>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-500/5">
                <div className="space-y-8">
                    {requiredDocs.map(docType => {
                        const docId = String(docType.id);
                        const isUploaded = !!documents[docId];
                        const isUploading = uploading[docId];
                        const docProgress = progress[docId] || 0;

                        return (
                            <div key={docId} className={`relative overflow-hidden group p-8 rounded-3xl border transition-all duration-300 ${isUploaded
                                ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                                : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700/50'
                                }`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className={`text-xl font-black ${isUploaded ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                                {docType.name}
                                            </h4>
                                            {isUploaded && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                                                    <span>✓</span> Encrypted
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{docType.description}</p>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        {isUploading ? (
                                            <div className="flex-1 md:flex-initial flex flex-col items-end gap-3 min-w-[120px]">
                                                <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                    <span>Broadcasting...</span>
                                                    <span>{docProgress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                                                        style={{ width: `${docProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ) : isUploaded ? (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <a
                                                    href={documents[docId].url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-1 md:flex-initial px-6 py-3 text-xs font-black uppercase tracking-widest bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-center"
                                                >
                                                    View File
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(docId, documents[docId].storagePath)}
                                                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                                                    title="Delete Document"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full md:w-auto">
                                                <input
                                                    type="file"
                                                    id={`file-${docId}`}
                                                    className="hidden"
                                                    onChange={(e) => handleUpload(docId, e)}
                                                    accept=".pdf,.jpg,.png"
                                                />
                                                <button
                                                    onClick={() => document.getElementById(`file-${docId}`).click()}
                                                    className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-600/20 transition-all active:scale-95 group/btn flex items-center justify-center gap-3"
                                                >
                                                    <span>Upload Document</span>
                                                    <span className="group-hover/btn:translate-y-[-2px] transition-transform">📄</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isUploaded && (
                                    <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-t border-emerald-100/50 dark:border-emerald-800/20 pt-4">
                                        <span>ID: {documents[docId].docTypeId}</span>
                                        <span>•</span>
                                        <span>Uploaded: {new Date(documents[docId].uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 rounded-[2rem] flex items-start gap-6">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100/50 dark:border-blue-800/50 flex-shrink-0">
                        🛡️
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 dark:text-blue-300 uppercase tracking-tighter text-sm mb-2">Vault Security Protocol</h4>
                        <p className="text-sm text-blue-800/70 dark:text-blue-400/70 leading-relaxed">
                            Fanya Pesa utilizes Google Cloud KMS for encryption management. All uploads are hashed to ensure data integrity. Funders can only access these documents once a deal is structured and signed via the platform's escrow service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
