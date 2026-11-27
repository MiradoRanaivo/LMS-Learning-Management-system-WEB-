/**
 * LMS Web - Client API Vanilla JS
 * Communique avec les endpoints PHP sous Apache/XAMPP
 */

const API = {
  baseUrl: new URL('../api', document.currentScript.src).pathname,
  userManagementCsrfToken: null,
  csrfToken: null,

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    };

    const formData = typeof FormData !== 'undefined' && config.body instanceof FormData;
    if (config.body && typeof config.body === 'object' && !formData) {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
      config.body = JSON.stringify(config.body);
    }

    if (!['GET', 'HEAD', 'OPTIONS'].includes((config.method || 'GET').toUpperCase())) {
      if (!this.csrfToken) {
        const sessionResponse = await fetch(`${this.baseUrl}/auth/me.php`, { headers: { Accept: 'application/json' } });
        const sessionData = await sessionResponse.json();
        this.csrfToken = sessionData.csrf_token || null;
      }
      if (this.csrfToken) config.headers['X-CSRF-Token'] = config.headers['X-CSRF-Token'] || this.csrfToken;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur');
      }
      return data;
    } catch (error) {
      console.error(`Erreur API (${endpoint}):`, error);
      throw error;
    }
  },

  // Auth
  async login(email, password) {
    return this.request('/auth/login.php', {
      method: 'POST',
      body: { email, password }
    });
  },

  async getMe() {
    const response = await this.request('/auth/me.php');
    this.csrfToken = response.csrf_token || this.csrfToken;
    return response;
  },

  async logout() {
    return this.request('/auth/logout.php', { method: 'POST' });
  },

  async updateProfile(profile) {
    return this.request('/profile/update.php', { method: 'POST', body: profile });
  },

  // Courses
  async getCourses(status = 'all') {
    return this.request(`/courses/list.php?status=${status}`);
  },

  async getMyEnrollments(courseId = null) {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return this.request(`/courses/enroll.php${query}`);
  },

  async getCourseEnrollments(courseId) {
    return this.request(`/courses/enroll.php?course_id=${encodeURIComponent(courseId)}`);
  },

  async getMyPreferences() {
    return this.request('/users/preferences.php');
  },

  async saveMyPreferences(preferences) {
    return this.request('/users/preferences.php', { method: 'POST', body: preferences });
  },

  async enrollCourse(courseId) {
    return this.request('/courses/enroll.php', {
      method: 'POST',
      body: { action: 'enroll', course_id: courseId }
    });
  },

  async updateEnrollmentStatus(courseId, status, userId = null) {
    return this.request('/courses/enroll.php', {
      method: 'POST',
      body: { action: 'update_status', course_id: courseId, status, user_id: userId }
    });
  },

  async cancelEnrollment(courseId) {
    return this.request('/courses/enroll.php', {
      method: 'POST',
      body: { action: 'cancel', course_id: courseId }
    });
  },

  async createCourse(course) {
    return this.request('/courses/list.php', { method: 'POST', body: course });
  },

  async getCourseDetail(courseId) {
    return this.request(`/courses/detail.php?id=${courseId}`);
  },

  async getChapters(courseId) {
    return this.request(`/courses/chapters.php?course_id=${courseId}`);
  },

  async manageChapter(chapter) {
    return this.request('/courses/chapters.php', { method: 'POST', body: chapter });
  },

  async getLesson(lessonId) {
    return this.request(`/courses/lessons.php?id=${lessonId}`);
  },

  async manageLesson(lesson) {
    return this.request('/courses/lessons.php', { method: 'POST', body: lesson });
  },

  async reorderLessons(chapterId, lessonIds) {
    return this.request('/courses/lessons.php', { method: 'POST', body: { action: 'reorder', chapter_id: chapterId, lesson_ids: lessonIds } });
  },

  async updateLessonProgress(lessonId, isCompleted) {
    return this.request('/courses/progress.php', {
      method: 'POST',
      body: { lesson_id: lessonId, is_completed: isCompleted ? 1 : 0 }
    });
  },

  // Quizzes
  async getQuiz(quizId) {
    return this.request(`/quizzes/get.php?id=${quizId}`);
  },

  async getQuizzes() {
    return this.request('/quizzes/list.php');
  },

  async createQuiz(quiz) {
    return this.request('/quizzes/list.php', { method: 'POST', body: quiz });
  },

  async submitQuiz(quizId, answers) {
    return this.request('/quizzes/submit.php', {
      method: 'POST',
      body: { quiz_id: quizId, answers }
    });
  },

  async getQuizAttempts(quizId = null) {
    const query = quizId ? `?quiz_id=${encodeURIComponent(quizId)}` : '';
    return this.request(`/quizzes/attempts.php${query}`);
  },

  async gradeQuizAttempt(attemptId, grades) {
    return this.request('/quizzes/grade.php', {
      method: 'POST',
      body: { attempt_id: attemptId, grades }
    });
  },

  // Assignments
  async getAssignments() {
    return this.request('/assignments/list.php');
  },

  async manageAssignment(assignment) {
    return this.request('/assignments/manage.php', { method: 'POST', body: assignment });
  },

  async submitAssignment(assignmentId, comment, file) {
    const body = new FormData();
    body.set('assignment_id', String(assignmentId));
    body.set('student_comment', comment);
    body.set('file', file);
    return this.request('/assignments/submit.php', { method: 'POST', body });
  },

  async gradeAssignment(submissionId, gradeValue, feedback) {
    return this.request('/assignments/grade.php', {
      method: 'POST',
      body: { submission_id: submissionId, grade_value: gradeValue, teacher_feedback: feedback }
    });
  },

  // Grades ECTS
  async getMyGrades() {
    return this.request('/grades/my_grades.php');
  },

  async getCourseGradebook(courseId = null) {
    const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : '';
    return this.request(`/grades/manage.php${query}`);
  },

  async saveCourseGrade(grade) {
    return this.request('/grades/manage.php', { method: 'POST', body: { action: 'save_course_grade', ...grade } });
  },

  async setGradePublication(type, id, action) {
    const body = type === 'course_grade' ? { type, grade_id: id, action }
      : type === 'assignment' ? { type, submission_id: id, action }
        : { type, attempt_id: id, action };
    return this.request('/grades/publication.php', { method: 'POST', body });
  },

  // Resources
  async getResources(type = 'all') {
    return this.request(`/resources/list.php?type=${type}`);
  },

  async addResource(resource) {
    return this.request('/resources/list.php', { method: 'POST', body: resource });
  },

  async saveResource(resource) {
    return this.request('/resources/list.php', { method: 'POST', body: resource });
  },

  async deleteResource(id) {
    const body = new FormData();
    body.set('action', 'delete');
    body.set('id', String(id));
    return this.request('/resources/list.php', { method: 'POST', body });
  },

  // Forum
  async getForumTopics(courseId = 0, filter = 'all') {
    return this.request(`/forum/topics.php?course_id=${courseId}&filter=${filter}`);
  },

  async createForumTopic(courseId, title, content) {
    return this.request('/forum/topics.php', { method: 'POST', body: { course_id: courseId, title, content } });
  },

  async replyForum(topicId, content) {
    return this.request('/forum/reply.php', {
      method: 'POST',
      body: { topic_id: topicId, content }
    });
  },

  // Calendar
  async getCalendarEvents(month = '') {
    return this.request(`/calendar/events.php?month=${month}`);
  },

  async addCalendarEvent(event) {
    return this.request('/calendar/events.php', { method: 'POST', body: event });
  },

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/dashboard/stats.php');
  },

  async getUsers(role = 'all') {
    const filters = typeof role === 'object' ? role : { role };
    const query = new URLSearchParams({
      role: filters.role || 'all',
      status: filters.status || 'all',
      search: filters.search || ''
    });
    const response = await this.request(`/users/manage.php?${query}`);
    this.userManagementCsrfToken = response.csrf_token || this.userManagementCsrfToken;
    return response;
  },

  async getUser(id) {
    const response = await this.request(`/users/manage.php?id=${encodeURIComponent(id)}`);
    this.userManagementCsrfToken = response.csrf_token || this.userManagementCsrfToken;
    return response;
  },

  async manageUser(action, user) {
    return this.request('/users/manage.php', {
      method: 'POST',
      headers: { 'X-CSRF-Token': this.userManagementCsrfToken || '' },
      body: { action, ...user }
    });
  },

  async getTeacherFollowRequests() {
    return this.request('/teachers/follow.php');
  },

  async reviewTeacherFollowRequest(studentId, action) {
    return this.request('/teachers/follow.php', {
      method: 'POST',
      body: { student_id: studentId, action }
    });
  },
};

window.LMS_API = API;

// Shared mobile navigation for the PHP/HTML pages.
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.lms-sidebar');
  const header = document.querySelector('.lms-main .lms-header');
  if (!sidebar || !header || header.querySelector('.mobile-nav-toggle')) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-nav-toggle';
  toggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'mobile-nav-backdrop';
  backdrop.setAttribute('aria-label', 'Fermer le menu de navigation');
  document.body.appendChild(backdrop);

  const closeMenu = () => {
    sidebar.classList.remove('mobile-drawer-open');
    backdrop.classList.remove('visible');
    document.body.classList.remove('mobile-nav-locked');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu de navigation');
  };

  const openMenu = () => {
    sidebar.classList.add('mobile-drawer-open');
    backdrop.classList.add('visible');
    document.body.classList.add('mobile-nav-locked');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer le menu de navigation');
  };

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('mobile-drawer-open')) closeMenu();
    else openMenu();
  });
  backdrop.addEventListener('click', closeMenu);
  sidebar.querySelectorAll('.lms-nav-link').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  header.insertBefore(toggle, header.firstChild);
});
