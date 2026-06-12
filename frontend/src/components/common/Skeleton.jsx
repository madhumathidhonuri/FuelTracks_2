const Skeleton = ({ variant = 'text', width, height, className = '' }) => {
  const variants = { text: 'h-4 rounded', title: 'h-6 rounded', avatar: 'w-10 h-10 rounded-full', thumbnail: 'w-20 h-20 rounded-xl', card: 'h-32 rounded-2xl' };
  return <div className={`skeleton ${variants[variant]} ${className}`} style={{ width, height }} />;
};
export default Skeleton;
