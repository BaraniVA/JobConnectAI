import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Adjust path if needed

// Get API key from Expo Constants
const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || '';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get Gemini model - UPDATED MODEL NAME
const getModel = () => {
  // Use the newer model version
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Changed from gemini-pro
};

/**
 * Generate content using Gemini AI
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    return ''; // Return empty string on error
  }
}

/**
 * Analyze job description for safety concerns and score
 */
export async function analyzeJobSafety(jobDescription: string): Promise<{
  safetyScore: number;
  safetyNotes: string[];
}> {
  const defaultResponse = { 
    safetyScore: 5, 
    safetyNotes: ['Could not analyze job safety'] 
  };
  
  try {
    const prompt = `
      Analyze the following job description for potential safety concerns.
      Rate the overall safety on a scale of 1-10 (10 being safest).
      Provide 3 specific safety notes or concerns.
      Format your response as JSON with fields: safetyScore (number) and safetyNotes (array of strings).
      
      Job Description:
      ${jobDescription}
    `;

    const response = await generateContent(prompt);
    
    // Better error handling for JSON parsing
    if (!response || response.trim() === '') {
      return defaultResponse;
    }
    
    try {
      // Extract JSON from response (handle cases where there might be extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return defaultResponse;
    } catch (parseError) {
      console.error('Error parsing safety analysis:', parseError);
      return defaultResponse;
    }
  } catch (error) {
    console.error('Error analyzing job safety:', error);
    return defaultResponse;
  }
}

// Match job to user skills and preferences
export async function matchJobToUser(
  jobDescription: string,
  userSkills: string[],
  userPreferences: Record<string, any>
): Promise<{
  matchScore: number;
  reasons: string[];
}> {
  const prompt = `
    Analyze how well the following job matches this user's skills and preferences.
    Rate the match on a scale of 1-10 (10 being perfect match).
    Provide 3 specific reasons for your rating.
    Format your response as JSON with fields: matchScore (number) and reasons (array of strings).
    
    Job Description:
    ${jobDescription}
    
    User Skills:
    ${userSkills.join(', ')}
    
    User Preferences:
    ${JSON.stringify(userPreferences)}
  `;

  try {
    const response = await generateContent(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error matching job to user:', error);
    return { matchScore: 5, reasons: ['Could not analyze job match'] };
  }
}

// Generate personalized job recommendations
export async function generateJobRecommendations(
  userProfile: Record<string, any>,
  availableJobs: any[]
): Promise<string[]> {
  const prompt = `
    Given this user profile and available jobs, recommend the top 3 most suitable jobs.
    Format your response as a JSON array of job IDs.
    
    User Profile:
    ${JSON.stringify(userProfile)}
    
    Available Jobs:
    ${JSON.stringify(availableJobs)}
  `;

  try {
    const response = await generateContent(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating job recommendations:', error);
    return [];
  }
}

/**
 * Process natural language search query using Gemini AI
 */
export async function processSearchQuery(query: string): Promise<{
  keywords: string[];
  filters: Record<string, any>;
}> {
  const defaultResponse = {
    keywords: [query],
    filters: {}
  };
  
  try {
    const model = getModel();
    const prompt = `
      Extract search keywords and filters from this job search query.
      Return JSON with: 
      - keywords: array of important search terms
      - filters: object with properties like location, salary, jobType
      
      Query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim() === '') {
      return defaultResponse;
    }
    
    // Extract JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return defaultResponse;
    } catch (parseError) {
      console.error('Error parsing search query response:', parseError);
      return defaultResponse;
    }
  } catch (error) {
    console.error('Error processing search query:', error);
    return defaultResponse;
  }
}

/**
 * Enhance voice search with Gemini AI
 */
export async function enhanceVoiceSearch(transcribedText: string): Promise<string> {
  try {
    const model = getModel();
    if (!model) return transcribedText;
    const prompt = `
      This text was transcribed from voice search. 
      Clean it up and make it a proper job search query.
      Fix any transcription errors.
      
      Transcribed Text: "${transcribedText}"
      
      Return only the improved search query text, no additional explanation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error enhancing voice search:', error);
    return transcribedText; // Return original text if enhancement fails
  }
}

/**
 * Search for jobs based on keywords and filters
 * Simple implementation without requiring authentication
 */
export async function searchJobs(
  keywords: string[],
  filters: Record<string, any>
): Promise<any[]> {
  try {
    // Get reference to jobs collection
    const jobsRef = collection(db, 'jobs');
    
    // Start with all jobs if no specific search criteria
    let jobsQuery = query(jobsRef);
    
    // Using a simple approach here for demo purposes
    // In a real app, you'd use a more sophisticated search strategy
    const snapshot = await getDocs(jobsQuery);
    
    // Get all jobs
    let allJobs: any[] = [];
    snapshot.forEach(doc => {
      allJobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filter jobs client-side based on keywords and filters
    return allJobs.filter(job => {
      // Check keywords
      if (keywords && keywords.length > 0) {
        const jobText = `${job.title} ${job.description} ${job.location}`.toLowerCase();
        const matchesKeyword = keywords.some(keyword => 
          jobText.includes(keyword.toLowerCase())
        );
        if (!matchesKeyword) return false;
      }
      
      // Check filters
      if (filters) {
        // Location filter
        if (filters.location && 
            job.location && 
            !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        
        // Salary filter
        if (filters.minSalary && 
            job.salary && 
            parseFloat(job.salary) < parseFloat(filters.minSalary)) {
          return false;
        }
        
        // Job type filter
        if (filters.jobType && 
            job.type && 
            job.type.toLowerCase() !== filters.jobType.toLowerCase()) {
          return false;
        }
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return [];
  }
}

/**
 * Get general job recommendations without requiring user authentication
 * Uses Gemini to categorize jobs into common interest areas
 */
export async function getGeneralJobRecommendations(
  allJobs: any[],
  category: string = 'popular' // Options: 'popular', 'safety', 'local', etc.
): Promise<any[]> {
  try {
    // If we have no jobs, return empty array
    if (!allJobs || allJobs.length === 0) {
      return [];
    }

    // For very small datasets, just return all jobs
    if (allJobs.length <= 3) {
      return allJobs;
    }

    const model = getModel();
    if (!model) return allJobs.slice(0, 3);
    const jobsJSON = JSON.stringify(allJobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      pay: job.pay,
      safetyScore: job.safetyScore
    })));

    const prompt = `
      You are a job recommendation system. Given this list of jobs, return the IDs of the 3 most
      ${category === 'safety' ? 'safe and trusted' : 
        category === 'local' ? 'locally relevant' : 'popular and suitable'} jobs.
      
      Jobs: ${jobsJSON}
      
      Return only a JSON array of job IDs, nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendedIds = JSON.parse(jsonMatch[0]);
      // Filter the jobs to return only recommended ones
      return allJobs.filter(job => recommendedIds.includes(job.id));
    }
    
    // Fallback if parsing fails - return first 3 jobs
    return allJobs.slice(0, 3);
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    // Return first 3 jobs as fallback
    return allJobs.slice(0, 3);
  }
}

