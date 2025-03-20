import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, where, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job, SafetyTip, Right, Report } from '@/types/firebase';

export function useJobs(searchTerm?: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobsRef = collection(db, 'jobs');
        let q = query(jobsRef);
        
        if (searchTerm) {
          q = query(jobsRef, where('title', '>=', searchTerm), where('title', '<=', searchTerm + '\uf8ff'));
        }

        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];

        setJobs(jobsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch jobs');
        setLoading(false);
      }
    }

    fetchJobs();
  }, [searchTerm]);

  return { jobs, loading, error };
}

export function useSafetyTips() {
  const [tips, setTips] = useState<SafetyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTips() {
      try {
        const tipsRef = collection(db, 'safetyTips');
        const querySnapshot = await getDocs(tipsRef);
        const tipsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SafetyTip[];

        setTips(tipsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch safety tips');
        setLoading(false);
      }
    }

    fetchTips();
  }, []);

  return { tips, loading, error };
}

export function useRights() {
  const [rights, setRights] = useState<Right[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRights() {
      try {
        const rightsRef = collection(db, 'rights');
        const querySnapshot = await getDocs(rightsRef);
        const rightsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Right[];

        setRights(rightsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rights');
        setLoading(false);
      }
    }

    fetchRights();
  }, []);

  return { rights, loading, error };
}

export async function reportJob(jobId: string, reason: string): Promise<void> {
  try {
    const reportsRef = collection(db, 'reports');
    await addDoc(reportsRef, {
      jobId,
      reason,
      timestamp: new Date()
    });
  } catch (err) {
    throw new Error('Failed to submit report');
  }
}