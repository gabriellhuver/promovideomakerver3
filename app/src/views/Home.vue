<template>
  <div class="home">
    <ControlBox />
    <ConsoleBox :msg="msg" />
    <CurrentVideo :current="current" v-if="this.$store.state.status" />
    <VideoList />
  </div>
</template>

<script>
import ControlBox from "../components/ControlBox";
import ConsoleBox from "../components/ConsoleBox";
import CurrentVideo from "../components/CurrentVideo";
import VideoList from "../components/VideoList";

export default {
  components: {
    ControlBox,
    ConsoleBox,
    CurrentVideo,
    VideoList
  },
  data() {
    return {
      current: { videoTitle: "", price: "", cupom: "", imagesNoBg: [""] },
      showVideo: false,
      msg: "idle"
    };
  },
  created() {
    this.sockets.subscribe("status", status => {
      this.$store.commit("status", status);
    });
    this.sockets.subscribe("current", data => {
      console.log(data);
      this.current = data;
    });
    this.sockets.subscribe("message", msg => {
      this.msg = msg.toString();
    });
    setInterval(() => {
      this.$socket.emit("status");
      this.$socket.emit("current");
    }, 2500);
  }
};
</script>
<style>
.home {
  text-align: center;
}
</style>