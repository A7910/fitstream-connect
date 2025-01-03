export const TrainingSection = () => {
  const trainingOptions = [
    {
      title: "PERSONAL TRAINING",
      image: "/placeholder.svg",
    },
    {
      title: "GROUP FITNESS CLASS",
      image: "/placeholder.svg",
    },
    {
      title: "FUNCTIONAL TRAINING",
      image: "/placeholder.svg",
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="font-bebas text-3xl mb-8">TRAININGS</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {trainingOptions.map((option, index) => (
            <div 
              key={index}
              className="relative rounded-xl overflow-hidden h-[200px] group cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />
              <img 
                src={option.image} 
                alt={option.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="font-bebas text-2xl">{option.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};