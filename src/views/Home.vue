<template>
  <div class="fullscreen-div">
    <img src="../assets/base.png" alt="BaseImage">
  </div>
  <div class="title-div">
    <img src="../assets/title.png" alt="Title">
  </div>
  <button class="enter" type="button" @click="enterwebsite">
    <i class="icon ion-md-lock"></i> ENTER
  </button>
</template>

<script>
export default {
  name: 'App',
  methods: {
    // 按钮点击跳转
    enterwebsite() {
      this.$router.push('/main');
    },
  },
  mounted() {
    // 监听按键事件，当按下 Enter 键时触发跳转
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    // 移除按键事件监听，避免内存泄漏
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        this.$router.push('/main');
      }
    },
    enterwebsite() {
      this.$router.push('/main');
    },
  },
};
</script>

<style scoped>
.fullscreen-div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}
.fullscreen-div img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-div {
  position: absolute;
  top: 10%;
  left: 20%;
  width: 10vw;
  height: 10vh;
  z-index: 1;
}
.title-div img {
  width: 600%;
  height: 600%;
  object-fit: cover;
}

.enter {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 70px;
  background-color: #8fa2de;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 20px;
  transition: background-color 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.enter:hover {
  background-color: #233268;
  box-shadow: -2px -2px 5px #fff, 2px 2px 5px #babecc;
}

.enter:active {
  box-shadow: -5px -5px 20px #fff, 5px 5px 20px #babecc;
  box-shadow: inset 1px 1px 2px #babecc, inset -1px -1px 2px #fff;
}

.icon {
  margin-right: 8px;
}
</style>
