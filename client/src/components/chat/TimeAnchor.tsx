interface TimeAnchorProps {
  name: string;
  timePeriod: string;
}

export default function TimeAnchor({ name, timePeriod }: TimeAnchorProps) {
  return (
    <div className="text-center py-3 px-4">
      <div className="inline-block px-4 py-1.5 bg-white/80 rounded-full border border-gray-200 text-xs text-wechat-text-secondary">
        这是 <span className="font-medium text-wechat-text">{timePeriod}</span> 的你
      </div>
    </div>
  );
}
