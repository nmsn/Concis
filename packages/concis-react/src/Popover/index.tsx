import React, {
  FC,
  memo,
  ReactNode,
  useState,
  useEffect,
  useMemo,
  useRef,
  useContext,
} from 'react';
import { GlobalConfigProps } from '../GlobalConfig/interface';
import cs from '../common_utils/classNames';
import { globalCtx } from '../GlobalConfig';
import lodash from 'lodash';
import './index.module.less';

interface popoverProps {
  children?: ReactNode;
  /**
   * @description 类名
   */
  className?: string;
  /**
   * @description 触发形式 hover/click
   * @default hover
   */
  type?: string;
  /**
   * @description 对齐方式 left/right/top/bottom
   * @default bottom
   */
  align?: string;
  /**
   * @description 卡片内容
   * @default <></>
   */
  content: ReactNode;
  /**
   * @description 卡片宽度
   * @default 200px
   */
  dialogWidth?: number | string;
  /**
   * @description 无边框
   * @default false
   */
  noBorder?: boolean;
  /**
   * @description 提供给调用层的卡片显示隐藏状态
   * @default false
   */
  propsVisible?: boolean;
  /**
   * @description 卡片显示隐藏回调
   */
  onVisibleChange?: Function;
}
type alignStyle = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  border?: string;
};
const Popover: FC<popoverProps> = (props: popoverProps) => {
  const {
    children,
    className,
    type = 'hover',
    align = 'bottom',
    content,
    noBorder,
    dialogWidth = 200,
    propsVisible,
    onVisibleChange,
  } = props;
  const showBtnRef = useRef();
  const dialogRef = useRef();

  const [showDialog, setShowDialog] = useState<boolean>(propsVisible || false); //是否显示
  const [showBtnSize, setShowBtnSize] = useState({
    width: '',
    height: '',
  });

  const { prefixCls, darkTheme } = useContext(globalCtx) as GlobalConfigProps;

  const classNames = cs(prefixCls, className, `concis-${darkTheme ? 'dark-' : ''}popover-card`);

  useEffect(() => {
    setShowBtnSize({
      width: (showBtnRef.current as any).offsetWidth,
      height: (showBtnRef.current as any).offsetHeight,
    });
    if (type == 'click') {
      window.addEventListener('click', () => {
        setShowDialog(false);
        if (propsVisible) {
          setShowDialog(false);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (propsVisible != undefined) {
      setShowDialog(propsVisible as boolean);
    }
  }, [propsVisible]);

  useEffect(() => {
    let isUnMounted = true;
    const dialogDom = dialogRef.current;
    if (showDialog) {
      (dialogDom as any).style.width = `${
        showDialog ? (dialogWidth === 'auto' ? 'auto' : dialogWidth + 'px') : '0px'
      }`;
      (dialogDom as any).style.height = showDialog ? '' : '0px';
      setTimeout(() => {
        // console.log(2, isUnMounted);
        if (isUnMounted) {
          (dialogDom as any).style.opacity = showDialog ? 1 : 0;
        }
      }, 100);
    } else {
      (dialogDom as any).style.opacity = showDialog ? 1 : 0;
      setTimeout(() => {
        // console.log(1, isUnMounted);
        if (isUnMounted) {
          (dialogDom as any).style.width = showDialog ? `${dialogWidth}px` : '0px';
          (dialogDom as any).style.height = showDialog ? '' : '0px';
        }
      }, 100);
    }
    return () => {
      isUnMounted = false;
    };
  }, [showDialog]);
  const clickToggleDialog = (e: any) => {
    //点击打开dialog
    e.stopPropagation();
    if (type == 'click') {
      setShowDialog(!showDialog);
      onVisibleChange && onVisibleChange(!showDialog);
    }
  };
  const hoverOpenDialog = lodash.debounce(() => {
    //移入打开dialog
    if (type == 'hover' && showDialog == false) {
      setShowDialog(true);

      onVisibleChange && onVisibleChange(true);
    }
  }, 200);
  const hoverCloseDialog = lodash.debounce(() => {
    //移开关闭dialog
    if (type == 'hover' && showDialog == true) {
      setShowDialog(false);
      onVisibleChange && onVisibleChange(false);
    }
  }, 200);
  const dialogStyle = useMemo(() => {
    let alignStyle: alignStyle = {};
    if (align == 'bottom') {
    } else if (align == 'top') {
      alignStyle.bottom = showBtnSize.height + 'px';
    } else if (align == 'right') {
      alignStyle.left = showBtnSize.width + 'px';
      alignStyle.bottom = Number(showBtnSize.height) / 2 + 'px';
    } else if (align == 'left') {
      alignStyle.right = showBtnSize.width + 'px';
      alignStyle.bottom = Number(showBtnSize.height) / 2 + 'px';
    }
    if (!noBorder) {
      alignStyle.border = '1px solid #ccc';
    }
    return {
      ...alignStyle,
    };
  }, [content, showDialog, propsVisible, showBtnSize]);
  return (
    <div className={classNames}>
      <div
        className="open-container"
        onMouseEnter={() => hoverOpenDialog()}
        onMouseLeave={() => hoverCloseDialog()}
      >
        <div className="show-btn" onClick={(e) => clickToggleDialog(e)} ref={showBtnRef as any}>
          {children}
        </div>
        <div
          className="pop-dialog"
          style={dialogStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => hoverOpenDialog()}
          onMouseLeave={() => hoverCloseDialog()}
          ref={dialogRef as any}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default memo(Popover);
