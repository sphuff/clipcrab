import React, { useEffect, useState, useRef } from 'react';
import { NORMAL_ALPHA, HOVER_ALPHA } from '../../constants';
import { Tooltip, Overlay } from 'react-bootstrap';
import './index.scss';
import WordBlock from './WordBlock';

const NO_CHILDREN_TOOLTIP_MESSAGE = 'Click on a single word to create an animation block with its neighbors on the left. Or, drag it towards the right.';
const CHILDREN_TOOLTIP_MESSAGE = 'Click on an already existing animation block to break it up. Or, drag it to grow';

export default function WordBlockComponent({ wordBlock, updateTextBlocks }: {wordBlock: WordBlock, updateTextBlocks: Function}) {
    const [isEditing, setIsEditing] = useState(false);

    const ref: React.RefObject<any> = useRef(null);
    const editRef: React.RefObject<any> = React.createRef();
    wordBlock.ref = ref;
    const [text, setText] = useState(wordBlock.word);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipText, setTooltipText] = useState(getTooltipText(wordBlock));

    useEffect(() => {
        setText(wordBlock.getText());
    }, []);

    useEffect(() => {
        if (ref.current) ref.current.innerText = text;
        if (editRef.current) editRef.current.value = text;
    }, [text]);

    const onHoverOver = (evt: any, wordBlock: WordBlock) => {
        if (!wordBlock.ref) return;
        wordBlock.ref.current.style.backgroundColor = `${wordBlock.rgba.replace(NORMAL_ALPHA, HOVER_ALPHA)}`
        setShowTooltip(true);
    }
    
    const onHoverLeave = (evt: React.MouseEvent<HTMLSpanElement>, wordBlock: WordBlock) => {
        if (!wordBlock.ref) return;
        wordBlock.ref.current.style.backgroundColor = `${wordBlock.rgba.replace(HOVER_ALPHA, NORMAL_ALPHA)}`
        wordBlock.ref.current.style.cursor = '';
        setShowTooltip(false);
    }

    const changeCursor = (evt: any) => {
        const xPos = evt.pageX - evt.target.offsetLeft;
        if (xPos < evt.target.offsetWidth / 2) {
            // is on left side
            evt.target.style.cursor = 'w-resize';
        } else {
            // is on right side
            evt.target.style.cursor = 'e-resize';
        }
    }

    const onDrag = (evt: React.DragEvent<HTMLSpanElement>, wordBlock: WordBlock) => {
        // if dragging left, shrink current and set
        const xPos = evt.pageX;
        if (xPos === 0) {
            // ignore, is just letting go
            return;
        }
        const next = wordBlock.getNextNode();
        const lastChild = wordBlock.getLastChild();
        const nextPosX = next ? next.ref!.current.getBoundingClientRect().left : undefined;
        const lastChildX = lastChild ? lastChild.xPos : undefined;
        // BUG: dragging for specific small word is annoying
        if (nextPosX && xPos > nextPosX) {
            console.log('right');
            wordBlock.addChild(next);
        } else if (lastChildX && xPos < lastChildX) {
            console.log('left');
            wordBlock.removeChild(wordBlock.getLastChild());
        }
    }

    const editWordBlock = () => {
        setIsEditing(true);
    }
    const onEditChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        wordBlock.customText = evt.target.value;
        setText(wordBlock.customText);
    }
    const onEditAccept = (ref: React.RefObject<any>) => {
        wordBlock.customText = ref.current.value;
        setText(wordBlock.getText());
        setIsEditing(false);
        updateTextBlocks(wordBlock);
    }
    const onEditCancel = () => {
        setText(wordBlock.getText());
        setIsEditing(false);
    }

    const deleteWord = (ref: React.RefObject<any>) => {
        wordBlock.deleteWord();
        setIsEditing(false);
    }

    const onClick = (evt: React.MouseEvent<HTMLSpanElement>, wordBlock: WordBlock) => {
        // if is already text block, break up
        if (wordBlock.children.length > 0) {
            wordBlock.customText = undefined;
            wordBlock.children.map(child => wordBlock.removeChild(child));
            // blank out custom text, since it was for the whole block
            updateTextBlocks(wordBlock);
            return;
        }
        let firstInBlock = wordBlock;
        if (wordBlock.prev === undefined || wordBlock.prev.parentWord !== undefined) {
            // if is first word, or first word outside of block, do nothing
            return;
        }
        while (firstInBlock.prev !== undefined && firstInBlock.prev.parentWord === undefined && !firstInBlock.prev.isDeleted) {
            firstInBlock = firstInBlock.prev;
        }
        let nextBlock = firstInBlock.next;
        while (nextBlock && nextBlock.id !== wordBlock.id) {
            firstInBlock.addChild(nextBlock);
            nextBlock = nextBlock!.next;
        }
        // add last block 
        firstInBlock.addChild(nextBlock);
        updateTextBlocks(firstInBlock);
    }

    const { rgba } = wordBlock;
    if (isEditing) {
        return (
            <div className='transcriptionInput-word'>
                <textarea
                    value={wordBlock.getText()}
                    ref={editRef}
                    onChange={(evt) => onEditChange(evt)}
                />
                <i className="fas fa-check" onClick={() => onEditAccept(editRef)}></i>
                <i className="far fa-times-circle" onClick={() => onEditCancel()}></i>
                <button className='' onClick={() => deleteWord(ref)}>Delete</button>
            </div>
        );
    }
    return (
        <>
            <span className='transcriptionInput-word text-sm cursor-pointer'
                ref={ref}
                onMouseEnter={(evt) => onHoverOver(evt, wordBlock)}
                onMouseMove={(evt) => onHoverOver(evt, wordBlock)}
                onMouseLeave={(evt) => onHoverLeave(evt, wordBlock)}
                onDrag={(evt) => onDrag(evt, wordBlock)}
                onAuxClick={() => editWordBlock()}
                onClick={(evt) => onClick(evt, wordBlock)}
                onDragEnd={() => updateTextBlocks(wordBlock)}
                onContextMenu={(evt) => evt.preventDefault()}
                draggable={true}
                style={{backgroundColor: `${rgba}`, display: wordBlock.isActive ? 'inline-block' : 'none'}}
            >
                {text}
            </span>
            <Overlay target={ref.current} show={showTooltip} placement='top'>
                <Tooltip id={`tooltip-wordblock-${wordBlock.id}`} className='bg-black px-4 py-2 rounded text-white text-xs'>
                    <div></div>
                    { tooltipText }
                </Tooltip>
            </Overlay>
        </>
    );
}

const getTooltipText = (wordBlock: WordBlock): string => {
    return wordBlock.hasChildren() ? CHILDREN_TOOLTIP_MESSAGE : NO_CHILDREN_TOOLTIP_MESSAGE;
}