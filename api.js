export class ApiManager {
    async getCurrentUser() {
        try {
            const user = await window.websim.getCurrentUser();
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    }
    
    async getFollowingUsers() {
        try {
            const currentUser = await this.getCurrentUser();
            
            const response = await fetch(`/api/v1/users/${currentUser.username}/following?first=100`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.following.data.map(item => item.follow.user);
        } catch (error) {
            console.error('Error fetching following users:', error);
            throw error;
        }
    }
    
    async getUserMostRecentProject(username) {
        try {
            const response = await fetch(`/api/v1/users/${username}/projects?first=1&posted=true`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.projects.data.length === 0) {
                return null;
            }
            
            return data.projects.data[0].project;
        } catch (error) {
            console.error(`Error fetching projects for ${username}:`, error);
            return null;
        }
    }
}

