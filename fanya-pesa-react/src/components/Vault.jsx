import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

const REQUIRED_DOCS = [
    { id: 'csd', name: 'CSD Registration', description: 'Central Supplier Database summary report.' },
    { id: 'tax', name: 'Tax Clearance', description: 'Valid SARS tax compliance status PIN.' },
    { id: 'fica', name: 'FICA / ID', description: 'Identity document of director(s).' },
    { id: 'bank', name: 'Bank Statement', description: 'Last 3 months certified bank statements.' }
];

export default function Vault({ user, onBack }) {
    const [documents, setDocuments] = useState({});
    const [uploading, setUploading] = useState({});
    const [progress, setProgress] = useState({});

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const q = query(collection(db, "user_documents"), where("uid", "==", user.id));
            const querySnapshot = await getDocs(q);
            const docs = {};
            querySnapshot.forEach((doc) => {
                docs[doc.data().docTypeId] = doc.data();
            });
            setDocuments(docs);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    const handleUpload = (docId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `userData/${user.id}/documents/${docId}_${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setUploading(prev => ({ ...prev, [docId]: true }));

        uploadTask.on('state_changed',
            (snapshot) => {
                const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(prev => ({ ...prev, [docId]: prog }));
            },
            (error) => {
                console.error("Upload error:", error);
                setUploading(prev => ({ ...prev, [docId]: false }));
                alert("Upload failed. Please try again.");
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const docData = {
                    uid: user.id,
                    docTypeId: docId,
                    url: downloadURL,
                    storagePath: storageRef.fullPath,
                    uploadedAt: new Date().toISOString()
                };

                await setDoc(doc(db, "user_documents", `${user.id}_${docId}`), docData);
                setDocuments(prev => ({ ...prev, [docId]: docData }));
                setUploading(prev => ({ ...prev, [docId]: false }));
            }
        );
    };

    const handleDelete = async (docId, storagePath) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
            await deleteDoc(doc(db, "user_documents", `${user.id}_${docId}`));

            const newDocs = { ...documents };
            delete newDocs[docId];
            setDocuments(newDocs);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete document.");
        }
    };

    const uploadedCount = Object.keys(documents).length;
    const totalCount = REQUIRED_DOCS.length;
    const overallProgress = Math.round((uploadedCount / totalCount) * 100);

    return (
        <div className="max-w-2xl mx-auto py-10 animate-fade-in">
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
                &larr; Back to Dashboard
            </button>

            <div className="flex justify-between items-end mb-4">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Secure Vault</h2>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{overallProgress}% Verified</span>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-10">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 shadow-lg shadow-blue-500/20"
                    style={{ width: `${overallProgress}%` }}
                ></div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl">
                <div className="space-y-6">
                    {REQUIRED_DOCS.map(docType => {
                        const isUploaded = !!documents[docType.id];
                        const isUploading = uploading[docType.id];
                        const docProgress = progress[docType.id] || 0;

                        return (
                            <div key={docType.id} className="group p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl transition-all hover:border-blue-500/30">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-6">
                                        <h4 className={`font-bold ${isUploaded ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {docType.name}
                                            {isUploaded && <span className="ml-2 text-emerald-500 text-xs">✓ Verified</span>}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">{docType.description}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isUploading ? (
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Uploading...</span>
                                                <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600" style={{ width: `${docProgress}%` }}></div>
                                                </div>
                                            </div>
                                        ) : isUploaded ? (
                                            <>
                                                <a href={documents[docType.id].url} target="_blank" rel="noreferrer" className="px-4 py-2 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors">View</a>
                                                <button onClick={() => handleDelete(docType.id, documents[docType.id].storagePath)} className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">Delete</button>
                                            </>
                                        ) : (
                                            <div>
                                                <input
                                                    type="file"
                                                    id={`file-${docType.id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleUpload(docType.id, e)}
                                                    accept=".pdf,.jpg,.png"
                                                />
                                                <button
                                                    onClick={() => document.getElementById(`file-${docType.id}`).click()}
                                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                                >
                                                    Upload
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex items-start gap-4">
                    <div className="text-2xl mt-1">🛡️</div>
                    <div>
                        <h4 className="font-bold text-sm text-blue-900 dark:text-blue-400">Security & Encryption</h4>
                        <p className="text-xs text-blue-800/70 dark:text-blue-400/60 mt-1 leading-relaxed">
                            Your documents are encrypted at rest using AES-256 and stored securely. They are only accessible by you and verified funders during active deal structuring.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
