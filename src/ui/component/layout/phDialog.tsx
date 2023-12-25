import React from 'react';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { PHButton, ButtonVariant } from '@local/ui/component/element/phButton';

type PHDialogActionType = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    onClick: () => void;
};

type PHDialogPropType = {
    header: React.ReactNode;
    children: React.ReactNode;
    actions: PHDialogActionType[];

    isOpen?: boolean;
    isNotModal?: boolean;
    isCancelable?: boolean;
    closeDialog: () => void;
};

const PHDialogStyle = css({
    userSelect: 'none',

    width: "80%",
    maxWidth: "40rem",

    color: 'var(--color)',
    borderRadius: 'var(--dialog-radius)',
    backdropFilter: "blur(0.75rem)",
    backgroundColor: "var(--dialog-background-color)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--box-shadow) var(--border-color)",

    padding: '1rem 1.5rem',
    '&>*': { marginBottom: '1rem' },
    '& form': {
        // Resetting react-bootstrap
        margin: '1rem 0',
        // Resetting mvp.css
        boxShadow: 'none',
        border: 'none',
        padding: '0',
    },
})

const PHDialogHeaderStyle = css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const PHDialogCancelBtnStyle = css({
    width: "20pt !important",
    height: "20pt !important",
    borderRadius: '0.25rem',
    transition: '0.1s',
    color: "var(--color)",
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    paddingLeft: "0 !important",
    paddingRight: "0 !important",
    ':hover': { backgroundColor: 'var(--color-25)' },
});

const PHDialogCancelBtnInlineStyle: React.CSSProperties = {
    // I hate to use inline style, but I have to use it.
    // Don't ask me why. I don't know why.
    border: "none",
    margin: 0,
    padding: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
}

const PHDialogChildrenStyle = css({
    borderTop: '1px solid var(--color-25)',
    borderBottom: '1px solid var(--color-25)',
});

const PHDialogActionStyle = css({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
});

export const PHDialog: React.FC<PHDialogPropType> = props => {
    const dialogRef = React.useRef<HTMLDialogElement>(null);

    const cancelDialog = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        if (!props.isCancelable) return;
        props.closeDialog();
    }

    React.useEffect(() => {
        dialogRef.current?.addEventListener('cancel', cancelDialog);
        return () => dialogRef.current?.removeEventListener('cancel', cancelDialog);
    }, []);
    // dialogRef.current?.addEventListener('hide', () => props.onClose?.());
    React.useEffect(() => {
        if (props.isOpen) {
            if (props.isNotModal) dialogRef.current?.show();
            else dialogRef.current?.showModal();
            return;
        }
        dialogRef.current?.close();
    }, [props.isOpen]);

    const closeBtn = <PHButton variant='link' onClick={props.closeDialog} style={PHDialogCancelBtnInlineStyle}>
        <Icon className={PHDialogCancelBtnStyle} path={mdiClose} size="16pt" />
    </PHButton>;
    const actionBtns = props.actions.map((action, index) => <PHButton
        key={index}
        onClick={action.onClick}
        variant={action.variant}
    >
        {action.children}
    </PHButton>);

    return <dialog className={PHDialogStyle} ref={dialogRef}>
        {/* Header */}
        <div className={PHDialogHeaderStyle}>
            {props.header}
            {props.isCancelable && closeBtn}
        </div>

        {/* Children */}
        <div className={PHDialogChildrenStyle}>
            {props.children}
        </div>

        {/* Action Buttons */}
        <nav className={PHDialogActionStyle}>{actionBtns}</nav>
    </dialog>;
}