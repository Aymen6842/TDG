import { Palette } from "lucide-react";
import TiptapActionButton from "./tiptap-action-button";
import { Dispatch, SetStateAction } from "react";
import { SketchPicker } from "react-color";
import { useClickAway } from "@uidotdev/usehooks";

interface Props {
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  iconSize: string;
  iconStyle: string;
}

export default function ColorPicker({
  color,
  setColor,
  isOpen,
  iconSize,
  iconStyle,
  setIsOpen
}: Props) {
  const colorRef = useClickAway<HTMLDivElement>(() => {
    setIsOpen(false);
  });
  const handleOpenning = () => {
    setIsOpen(!isOpen);
  };

  const onColorChange = (color: { hex: string }) => {
    setColor(color.hex);
  };

  return (
    <div ref={colorRef} className="relative">
      <TiptapActionButton
        icon={
          <div className="flex flex-col space-y-[2px]">
            <Palette size={iconSize} className={iconStyle} />
            <div className="h-[2px] w-4 rounded-full" style={{ backgroundColor: color }} />
          </div>
        }
        onPressedChange={handleOpenning}
        ariaLabel={"Text Color"}
      />
      {isOpen && <SketchPicker className="absolute z-20" onChange={onColorChange} color={color} />}
    </div>
  );
}
