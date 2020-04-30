type TaskFunc = () => void;
export class Task {
	private static isRunning: boolean = false;
	private static waitingList: TaskFunc[] = [];
	public static run(callable?: TaskFunc) {
		if (callable) {
			this.waitingList.push(callable);
		}
		if (!this.isRunning) {
			this.isRunning = true;
			const func = this.waitingList.pop();
			if (func) {
				(new Promise((resolve) => {
					func();
					resolve();
				})).then(() => {
					this.isRunning = false;
					this.run();
				});
			} else {
				this.isRunning = false;
			}
		}
	}
}
