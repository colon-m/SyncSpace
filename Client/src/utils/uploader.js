export class UploadController {
  constructor(maxConcurrent = 4, maxRetries = 3, setProgress = null, fileSize) {
    this.maxConcurrent = maxConcurrent;
    this.maxRetries = maxRetries;
    this.activeUploads = 0;
    this.pendingChunks = [];
    this.uploadedChunks = new Map(); // 记录成功上传的分片
    this.failedChunks = [];
    this.retryDelays = [1000, 3000, 10000]; // 重试延迟 (ms)
    this.setProgress = setProgress;
    this.fileSize = fileSize
  }

  // 添加分片到队列
  enqueue(chunk) {
    this.pendingChunks.push(chunk);
  }

  // 开始处理队列
  async processQueue(uploadCallback) {
    while (this.pendingChunks.length > 0 || this.activeUploads > 0) {
      // 填充可用槽位
      const availableSlots = this.maxConcurrent - this.activeUploads;
      if (availableSlots > 0 && this.pendingChunks.length > 0) {
        const nextChunks = this.pendingChunks.splice(0, availableSlots);
        nextChunks.forEach(chunk => {
          this._uploadChunk(chunk, uploadCallback);
        });
      }
      
      // 等待100ms再检查状态
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 处理失败的分片
    await this._retryFailedChunks(uploadCallback);
  }

  // 上传单个分片
  async _uploadChunk(chunk, callback) {
    this.activeUploads++;
    
    try {
      await callback(chunk);
      this.uploadedChunks.set(chunk.index, chunk.size);
      this.updateProgress();
    } catch (error) {
      console.error(`分片 ${chunk.index} 上传失败:`, error);
      this.failedChunks.push(chunk);
    } finally {
      this.activeUploads--;
    }
  }

  // 重试失败的分片
  async _retryFailedChunks(callback) {
    for (const chunk of this.failedChunks) {
      let retryCount = 0;
      let success = false;
      
      while (retryCount < this.maxRetries && !success) {
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelays[retryCount])
        );
        
        try {
          await callback(chunk);
          this.uploadedChunks.set(chunk.index, chunk.size);
          success = true;
        } catch (error) {
          console.error(`分片 ${chunk.index} 第${retryCount+1}次重试失败:`, error);
          retryCount++;
        }
      }
      
      if (!success) {
        throw new Error(`分片 ${chunk.index} 所有重试均失败`);
      }
    }
  }

  // 获取已上传的总字节数
  get uploadedSize() {
    return [...this.uploadedChunks.values()].reduce((sum, size) => sum + size, 0);
  }

    updateProgress () {
        const uploaded = this.uploadedSize;
        const progress = Math.round((uploaded / this.fileSize) * 100);
        this.setProgress(progress);
    };
}