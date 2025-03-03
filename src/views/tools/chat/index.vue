<script setup lang="ts">
import { getUserFriendListAPI, getUsersMessageAPI } from "@/apis/user";
import { Search } from "@element-plus/icons-vue";
import {
  ref,
  computed,
  inject,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import { useLoginStore } from "@/stores/LoginStore";
import WebSocketClient from "@/utils/webSocket";
import type { ElScrollbar } from "element-plus";

const isCollapse = inject("isCollapse");
// ... 其他导入和类型定义 ...

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const shouldAutoScroll = ref(true);
const inputMessage = ref("");
const chatContent = ref(null);
const searchKey = ref("");
// 获取所有好友
const loginStore = useLoginStore();
const username = loginStore.userInfo.username;

const currentChat = ref({
  id: "0",
  username: "",
  avatarPath: "",
  content: "",
  lastTime: "",
});
const wsClient = new WebSocketClient(`ws://localhost:8080/chat?${username}`);

type friend = {
  id: string;
  username: string;
  avatarPath: string;
  lastMessage: string;
  lastTime: string;
};

const friendList = ref<friend[]>([]);
const getAllFriendList = async () => {
  const res = await getUserFriendListAPI(username);
  friendList.value = res.data;
};
onMounted(() => {
  getAllFriendList();
});

// 搜索过滤
const filteredFriends = computed(() => {
  if (!searchKey.value) return friendList.value;
  return friendList.value.filter((friend: friend) =>
    friend.username.toLowerCase().includes(searchKey.value.toLowerCase())
  );
});

// 模拟好友数据
const messageList = ref([]);
const getUsersMessage = async (username: string, friendUsername: string) => {
  const res = await getUsersMessageAPI(username, friendUsername);
  messageList.value = res.data;
};

onBeforeUnmount(() => {
  wsClient.close();
});

// 监听消息列表变化
watch(
  () => messageList.value,
  async () => {
    if (shouldAutoScroll.value) {
      await nextTick();
      scrollToBottom();
    }
  },
  { deep: true }
);

// 优化后的滚动到底部方法
const scrollToBottom = () => {
  if (!scrollbarRef.value) return;

  const scrollbar = scrollbarRef.value;
  scrollbar.setScrollTop(scrollbar.wrapRef!.scrollHeight);
};

// 监听消息,接收消息
wsClient.on("message", (data) => {
  messageList.value.push(JSON.parse(data));
});

// 选择聊天对象
const selectChat = (friend: friend) => {
  // 连接 WebSocket
  wsClient.connect();
  getUsersMessage(username, friend.username);
  currentChat.value = {
    id: friend.id,
    username: friend.username,
    avatarPath: friend.avatarPath,
    content: messageList.value[messageList.value.length - 1],
    lastTime: "昨天",
  };
  // shouldAutoScroll.value = true;
};

const sendMessage = () => {
  if (!inputMessage.value.trim() || !currentChat.value) return;
  const newMessage = ref({
    sender: username,
    content: inputMessage.value,
    recipient: currentChat.value.username,
  });
  wsClient.send(newMessage.value);
  messageList.value = [...messageList.value, newMessage.value];
  // messageList.value.push(newMessage.value);
  currentChat.value.content = inputMessage.value;
  currentChat.value.lastTime = "刚刚";
  inputMessage.value = "";
};
</script>
<template>
  <div
    class="body"
    :class="{ left: isCollapse }"
    style="transition: all 0.3s; z-index: 9; overflow: hidden"
  >
    <div class="page-container">
      <!-- 左侧聊天区域 -->
      <div class="chat-container">
        <el-header class="chat-header">
          <span>用户: {{ currentChat?.username || "未选择" }}</span>
          <el-button type="primary" size="small" class="header-btn">
            <el-icon><More /></el-icon>
          </el-button>
        </el-header>

        <div class="chat-content" ref="chatContent" v-if="currentChat">
          <el-scrollbar style="height: 600px" ref="scrollbarRef" :always="true">
            <div class="message-list">
              <div
                v-for="(msg, index) in messageList"
                :key="index"
                :class="[
                  'message-item',
                  msg.sender === username ? 'message-right' : 'message-left',
                ]"
              >
                <div class="message-bubble">{{ msg.content }}</div>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <div class="chat-empty" v-else>请选择一个联系人开始聊天</div>

        <div class="chat-footer" v-if="currentChat?.username">
          <el-input
            v-model="inputMessage"
            placeholder="请输入消息"
            :rows="3"
            style="width: 100%"
            @keyup.enter="sendMessage"
          >
            <template #append>
              <el-button type="primary" @click="sendMessage">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 右侧好友列表 -->
      <div class="friend-container">
        <div class="friend-header">
          <el-input
            v-model="searchKey"
            placeholder="搜索联系人"
            :prefix-icon="Search"
          />
        </div>

        <el-scrollbar class="friend-list">
          <div class="friend-group">
            <div class="group-title">我的好友</div>
            <div
              v-for="friend in filteredFriends"
              :key="friend.id"
              :class="[
                'friend-item',
                { active: currentChat?.id === friend.id },
              ]"
              @click="selectChat(friend)"
            >
              <el-avatar :size="40" :src="friend.avatarPath" />
              <div class="friend-info">
                <div class="friend-name">{{ friend.username }}</div>
                <div class="friend-message">{{ friend.lastMessage }}</div>
              </div>
              <div class="friend-time">{{ friend.lastTime }}</div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
// 定义变量
$header-height: 60px;
$footer-height: 120px;
$primary-color: #409eff;
$border-color: #e4e7ed;
$bg-color: #f5f7fa;
$friend-width: 280px;
.body {
  box-sizing: border-box;
  position: absolute;
  left: 199px;
  top: 80px;
  width: calc(100% - 199px);
  padding: 26px 32px;
  .page-container {
    display: flex;
    height: 80vh;
    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-right: 1px solid $border-color;
      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: $bg-color;
        border-bottom: 1px solid $border-color;
        height: $header-height;
      }
      .chat-content {
        flex: 1;
        padding: 20px;
        background-color: $bg-color;

        .message-list {
          padding: 10px;
        }

        .message-item {
          margin: 10px 0;
          display: flex;

          &.message-left {
            justify-content: flex-start;
          }

          &.message-right {
            justify-content: flex-end;

            .message-bubble {
              background-color: $primary-color;
              color: #fff;
            }
          }

          .message-bubble {
            max-width: 70%;
            padding: 10px 15px;
            border-radius: 4px;
            background-color: #fff;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          }
        }
      }
      .chat-empty {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #909399;
        font-size: 16px;
        background-color: $bg-color;
      }
      .chat-footer {
        padding: 10px 0;
        background-color: #fff;
        border-top: 1px solid $border-color;
        height: $footer-height;
        .el-input {
          .el-input__wrapper {
            padding: 0;
          }

          .el-textarea__inner {
            resize: none;
          }
        }
      }
    }
    .friend-container {
      width: $friend-width;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      .friend-header {
        padding: 10px;
        border-bottom: 1px solid $border-color;
        background-color: #fff;
      }

      .friend-list {
        flex: 1;
        background-color: #fff;

        .friend-group {
          .group-title {
            padding: 10px;
            font-size: 14px;
            color: #909399;
            background-color: $bg-color;
          }

          .friend-item {
            display: flex;
            align-items: center;
            padding: 10px;
            cursor: pointer;
            transition: background-color 0.3s;

            &:hover {
              background-color: #f5f7fa;
            }

            &.active {
              background-color: #ecf5ff;
            }

            .friend-info {
              flex: 1;
              margin-left: 10px;
              overflow: hidden;

              .friend-name {
                font-size: 14px;
                margin-bottom: 4px;
              }

              .friend-message {
                font-size: 12px;
                color: #909399;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .friend-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}
.el-scrollbar__wrap {
  scroll-behavior: smooth; /* 平滑滚动效果 */
}
.left {
  left: 59px;
  width: calc(100% - 59px);
}
</style>
