import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      userName: 'Katlego Moikabi',
      email: 'katlego1424@gmail.com',
      memberSince: '8/12/2023',
      pfp: 'https://picsum.photos/id/22/200/300',
      is2FAEnabled: true,
    }
  },

  actions: {
    toggle2FA() {
      this.is2FAEnabled = !this.is2FAEnabled
    },

    changeUserName(userName: string) {
      this.userName = userName
    },
  },
})
