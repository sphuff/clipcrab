export default class WordBlock {
    children: WordBlock[];
    isActive: boolean;
    isDeleted: boolean;
    startTime: Number;
    endTime: Number;
    private _id: Number;
    parentWord?: WordBlock;
    private _prev?: WordBlock;
    private _next?: WordBlock;
    word: string;
    rgba: string;
    xPos: Number;
    customText?: string;
    private _ref?: React.RefObject<any>;
    
    constructor(word: string, startTime: Number, endTime: Number, rgba: string) {
        this.children = [];
        this.isActive = true;
        this.isDeleted = false;
        this.parentWord = undefined;
        this.word = word;
        this.startTime = startTime;
        this.endTime = endTime;
        this._id = Math.floor(Math.random() * 100000);
        this._ref = undefined;
        this.rgba = rgba;
        this.xPos = 0;
        this._ref = undefined;
    }

    public get id() {
        return this._id;
    }

    public get ref() {
        return this._ref;
    }

    public set ref(ref: React.RefObject<any>|undefined) {
        this._ref = ref;
    }

    getText(): string {
        if (this.customText) return this.customText;
        const childText = this.children.map(child => child.word).join(' ');
        if (childText === '') return this.word;
        return this.word + ' ' + childText;
    }

    getLastChild(): WordBlock|undefined {
        if (this.children.length > 0) {
            // get a non-deleted child from the back
            return this.children.slice(0).reverse().find(child => !child.isDeleted);
        } else {
            return undefined;
        }
    }

    hasChildren(): Boolean {
        return this.children.length > 0;
    }

    removeChild (childBlock: WordBlock|undefined) {
        if (!childBlock || !childBlock.ref || !this.ref) return;
        this.children = this.children.filter(child => child.id !== childBlock.id);
        childBlock.isActive = true;
        childBlock.parentWord = undefined;
        let parentText = this.getText();
        const padding = 10;
        childBlock.ref.current.style.display = 'inline-block';
        // no idea why x3, but it works
        const newWidth = this.ref.current.clientWidth - childBlock.ref.current.clientWidth - (3*padding);
        // this.ref.current.style.minWidth = `${newWidth}px`;
        this.ref.current.innerText = parentText;
    }

    addChild(childBlock: WordBlock|undefined) {
        if (!childBlock || !childBlock.ref || !this.ref) {
            return;
        }
        this.children.push(childBlock);
        childBlock.isActive = false;
        childBlock.parentWord = this;
        if (childBlock.children.length > 0) {
            // children should be added to parent block
            childBlock.children.forEach(child => {
                this.removeChild(child);
            });
            childBlock.children = [];
        }
        const padding = 10;
        childBlock.xPos = childBlock.ref.current.offsetLeft;
        const newWidth = this.ref.current.clientWidth + childBlock.ref.current.clientWidth + padding;
        // this.ref.current.style.minWidth = `${newWidth}px`;
        childBlock.ref.current.style.display = 'none';
        const text = this.getText();
        this.ref.current.innerText = text;
    }

    deleteWord() {
        this.isActive = false;
        this.isDeleted = true;
        this.prev!.next = this.next;
        if (this.children.length > 0) {
            this.children.map(child => {
                this.removeChild(child);
            });
            this.children = [];
        }
    }

    public get prev() {
        return this._prev;
    }

    public set prev(wordBlock: WordBlock|undefined) {
        this._prev = wordBlock;
    }

    public get next() {
        return this._next;
    }

    public getNextNode(): WordBlock|undefined {
        const lastChild = this.getLastChild()
        return lastChild ? lastChild.next : this.next;
    }

    public set next(wordBlock: WordBlock|undefined) {
        this._next = wordBlock;
    }
    
}