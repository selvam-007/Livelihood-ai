/*
 * Unified Production API Client for LivelihoodAI.
 * Configurable base URL with automatic token header injection,
 * robust network error handling, 401 unauthorized auto-logout, and typed helper methods.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');
export const AUTH_TOKEN_KEY = 'livelihood_token';

async function request(endpoint, options = {}) {
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    url = `${BASE_URL}${cleanEndpoint}`;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Inject JWT Bearer token if present
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    // Let browser set multipart content-type boundary
    delete headers['Content-Type'];
    config.body = options.body;
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Automatic 401 Unauthorized handling: evict stale token and notify application
      if (res.status === 401) {
        const hadToken = !!localStorage.getItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('livelihood_user');
        localStorage.removeItem('livelihood_role');
        if (typeof window !== 'undefined' && hadToken && !options.skipAuthRedirect) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }

      const errorMsg = data?.detail || data?.message || `HTTP Error ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`[API Client] Error on ${options.method || 'GET'} ${url}:`, error);
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body, headers }),
  delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers }),

  // Authentication & Profile APIs
  login: async (identifier, password) => {
    const isEmail = identifier && identifier.includes('@');
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? identifier.trim() : undefined,
        password
      }
    });
    if (res?.data?.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.access_token);
      if (res?.data?.user) {
        localStorage.setItem('livelihood_user', JSON.stringify(res.data.user));
        localStorage.setItem('livelihood_role', res.data.user.role || 'candidate');
      }
    }
    return res;
  },

  register: async (userData) => {
    const payload = { ...userData };
    if (payload.email && !payload.email.includes('@')) {
      if (!payload.phone) {
        payload.phone = payload.email.trim();
      }
      delete payload.email;
    }
    const res = await request('/api/v1/auth/register', {
      method: 'POST',
      body: payload
    });
    if (res?.data?.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.access_token);
      if (res?.data?.user) {
        localStorage.setItem('livelihood_user', JSON.stringify(res.data.user));
        localStorage.setItem('livelihood_role', res.data.user.role || 'candidate');
      }
    }
    return res;
  },

  getMe: async () => {
    return request('/api/v1/auth/me', { skipAuthRedirect: true });
  },

  getMyProfile: async () => {
    return request('/api/v1/profile/me', { skipAuthRedirect: true });
  },

  updateMyProfile: async (profileData) => {
    return request('/api/v1/profile/me', {
      method: 'PUT',
      body: profileData
    });
  },

  // Recommendation & Catalog APIs
  getRankedRecommendations: async (profilePayload) => {
    return request('/api/v1/recommendations/rank', {
      method: 'POST',
      body: profilePayload
    });
  },

  getMyRecommendations: async () => {
    return request('/api/v1/recommendations/me');
  },

  getOccupations: async () => {
    return request('/api/v1/competencies/occupations');
  },

  getOccupationDetails: async (qpCode) => {
    return request(`/api/v1/competencies/occupations/${encodeURIComponent(qpCode)}`);
  },

  // Gap Analysis & Roadmaps
  getGapAnalysis: async (skills, qpCode) => {
    return request('/api/v1/competencies/gap-analysis', {
      method: 'POST',
      body: { skills, qp_code: qpCode }
    });
  },

  getRoadmap: async (qpCode, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/v1/pathways/roadmap/${encodeURIComponent(qpCode)}${query ? `?${query}` : ''}`);
  },

  explainPathway: async (qpCode, qType, lang = 'en') => {
    return request(`/api/v1/pathways/explain?qp_code=${encodeURIComponent(qpCode)}&question=${encodeURIComponent(qType)}&language=${encodeURIComponent(lang)}`);
  },

  // Training Centres Directory with Distance Filter
  getTrainingCentres: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/api/v1/competencies/centres${query ? `?${query}` : ''}`);
  },

  // Scheme Eligibility Engine
  checkSchemeEligibility: async (profilePayload) => {
    return request('/api/v1/recommendations/scheme-eligibility', {
      method: 'POST',
      body: profilePayload
    });
  },

  // Candidate Progress Tracking
  getProgress: async () => {
    return request('/api/v1/profile/progress');
  },

  enrollCourse: async (enrollData) => {
    return request('/api/v1/profile/progress/enroll', {
      method: 'POST',
      body: enrollData
    });
  },

  completeNosModule: async (nosData) => {
    return request('/api/v1/profile/progress/complete-nos', {
      method: 'POST',
      body: nosData
    });
  },

  // Voice Assessment & Speech Pipeline
  uploadAudioVoiceNote: async (formData) => {
    return request('/api/v1/voice/upload-audio', {
      method: 'POST',
      body: formData
    });
  },

  pollSttJob: async (jobId) => {
    return request(`/api/v1/voice/stt-job/${encodeURIComponent(jobId)}`);
  },

  processVoiceSession: async (sessionData) => {
    return request('/api/v1/voice/process-session', {
      method: 'POST',
      body: sessionData,
      skipAuthRedirect: true
    });
  },

  getConversationalFollowups: async (unresolvedFields, language = 'en') => {
    return request('/api/v1/voice/conversational-followup', {
      method: 'POST',
      body: { unresolved_fields: unresolvedFields, language },
      skipAuthRedirect: true
    });
  },

  sendNotification: async (payload) => {
    return request('/api/v1/voice/send-notification', {
      method: 'POST',
      body: payload
    });
  },

  // Assessment Analysis Engine
  analyzeAssessment: async (payload) => {
    return request('/api/v1/assessment/analyze', {
      method: 'POST',
      body: payload,
      skipAuthRedirect: true
    });
  },

  applyAssessmentToProfile: async (payload) => {
    return request('/api/v1/assessment/apply-to-profile', {
      method: 'POST',
      body: payload
    });
  },

  // State Skilling Administration APIs
  getAdminAnalytics: async () => {
    return request('/api/v1/admin/analytics');
  },

  seedSyntheticData: async () => {
    return request('/api/v1/admin/seed-synthetic-data', {
      method: 'POST'
    });
  },

  // Compliance Consent & Feedback
  recordConsent: async (consentData) => {
    return request('/api/v1/profile/consent', {
      method: 'POST',
      body: consentData
    });
  },

  submitFeedback: async (feedbackData) => {
    return request('/api/v1/profile/feedback', {
      method: 'POST',
      body: feedbackData
    });
  },

  // Training provider: verify NOS completion
  verifyNosModule: async (verifyData) => {
    return request('/api/v1/profile/progress/verify-nos', {
      method: 'POST',
      body: verifyData
    });
  },

  // Phone OTP Authentication (Candidates & General)
  sendPhoneOtp: async (phone) => {
    return request('/api/v1/auth/otp/send', {
      method: 'POST',
      body: { phone }
    });
  },

  verifyPhoneOtp: async (otpPayload) => {
    return request('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: otpPayload
    });
  },

  // Field Agent Assisted Workflows
  getAgentBeneficiaries: async () => {
    return request('/api/v1/agent/beneficiaries');
  },

  registerBeneficiary: async (beneData) => {
    return request('/api/v1/agent/beneficiaries', {
      method: 'POST',
      body: beneData
    });
  },

  agentVerifySkill: async (candidateId, verifyData) => {
    return request(`/api/v1/agent/beneficiaries/${encodeURIComponent(candidateId)}/verify-skill`, {
      method: 'POST',
      body: verifyData
    });
  },

  agentAssistedInterview: async (candidateId, interviewData) => {
    return request(`/api/v1/agent/beneficiaries/${encodeURIComponent(candidateId)}/voice-interview`, {
      method: 'POST',
      body: interviewData
    });
  },

  // Training Provider Course & Batch Management
  getProviderBatches: async () => {
    return request('/api/v1/provider/batches');
  },

  createProviderBatch: async (batchData) => {
    return request('/api/v1/provider/batches', {
      method: 'POST',
      body: batchData
    });
  },

  getBatchEnrollments: async (batchId) => {
    return request(`/api/v1/provider/enrollments?batch_id=${encodeURIComponent(batchId)}`);
  },

  updateBatchAttendance: async (enrollmentId, attendanceData) => {
    return request(`/api/v1/provider/enrollments/${encodeURIComponent(enrollmentId)}/attendance`, {
      method: 'POST',
      body: attendanceData
    });
  },

  completeBatchEnrollment: async (enrollmentId, completionData) => {
    return request(`/api/v1/provider/enrollments/${encodeURIComponent(enrollmentId)}/complete`, {
      method: 'POST',
      body: completionData
    });
  },

  // Data Subject Rights (DPDP / GDPR)
  exportMyData: async () => {
    return request('/api/v1/profile/export-data');
  },

  deleteMyAccount: async () => {
    return request('/api/v1/profile/delete-account', {
      method: 'DELETE'
    });
  },

  // Audit Logs (Admin / Field Agent actions)
  getAdminAuditLogs: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/api/v1/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  // AI Counselor — full multilingual conversation with NSQF/scheme/website knowledge
  askCounselor: async ({ query, language = 'en', context = {}, conversationHistory = [] }) => {
    return request('/api/v1/counselor/ask', {
      method: 'POST',
      body: {
        query,
        language,
        context,
        conversation_history: conversationHistory
      }
    });
  }
};

export default apiClient;

