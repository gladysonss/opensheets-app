type DotIconProps = {
  bg_dot: string;
};

export default function DotIcon({ bg_dot }: DotIconProps) {
  return (
    <span>
      <span className={`${bg_dot} flex h-2 w-2 rounded-full`}></span>
    </span>
  );
}
