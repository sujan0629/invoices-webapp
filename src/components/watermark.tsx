
interface WatermarkProps {
  text: string;
}

const Watermark = ({ text }: WatermarkProps) => {
    let colorClass = '';
    switch(text.toUpperCase()){
        case 'PAID': colorClass = 'text-green-500/20'; break;
        case 'PARTIAL': colorClass = 'text-yellow-500/20'; break;
        case 'UNPAID': colorClass = 'text-red-500/20'; break;
    }

  return (
    <div className={`absolute inset-0 flex items-center justify-center -z-10 pointer-events-none`}>
      <p className={`text-9xl font-bold uppercase transform -rotate-45 ${colorClass} select-none`}>
        {text}
      </p>
    </div>
  );
};

export default Watermark;
