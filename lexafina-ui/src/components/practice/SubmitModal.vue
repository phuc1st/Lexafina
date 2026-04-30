<script setup>
defineProps({
  open: Boolean,
  answered: { type: Number, required: true },
  total: { type: Number, required: true },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-mask" @click.self="emit('cancel')">
      <div class="modal">
        <h3>Nộp bài?</h3>
        <p>
          Bạn đã trả lời <strong>{{ answered }}/{{ total }}</strong> câu.
          <span v-if="answered < total">Câu chưa trả lời sẽ bị tính sai.</span>
        </p>
        <div class="actions">
          <button class="btn btn--ghost" @click="emit('cancel')">Quay lại</button>
          <button class="btn btn--primary" @click="emit('confirm')">Nộp bài</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.modal h3 { margin: 0 0 8px; font-size: 18px; }
.modal p { margin: 0 0 18px; color: #374151; line-height: 1.5; }
.actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn {
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.btn--ghost {
  background: #f3f4f6;
  color: #374151;
}
.btn--ghost:hover { background: #e5e7eb; }
.btn--primary {
  background: #2563eb;
  color: #fff;
}
.btn--primary:hover { background: #1e40af; }
</style>
