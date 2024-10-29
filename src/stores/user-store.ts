import { defineStore } from 'pinia';
import { db } from '../firebase'; // Adjust the import according to your setup
import { doc, getDoc } from 'firebase/firestore';

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userName: '',
      email: '',
      memberSince: '',
      pfp: '',
      is2FAEnabled: true,
      role: ''
    };
  },

  actions: {
    async fetchUser() {
      const guid = localStorage.getItem('guid');
      if (!guid) {
        console.error('No GUID found in localStorage');
        return;
      }

      try {

        const userDocRef = doc(db, 'users', guid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          console.log(userData.name, userData.email);
          this.userName = userData.name || 'Default Name';
          this.email = userData.email || 'default@example.com';
          this.memberSince = userData.memberSince || new Date().toLocaleDateString();
          this.pfp = userData.pfp || 'https://picsum.photos/id/22/200/300'
          this.role = userData.role;
          this.is2FAEnabled = userData.is2FAEnabled !== undefined ? userData.is2FAEnabled : true;
        } else {
          console.error(`No user found for GUID: ${guid}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },

    toggle2FA() {
      this.is2FAEnabled = !this.is2FAEnabled;
    },

    changeUserName(userName: string) {
      this.userName = userName;
    },
  },
});
