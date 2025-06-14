
export const TrainingSection = () => {
  const trainingOptions = [
    {
      title: "PERSONAL TRAINING",
      image: "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=800&q=80", // personal coach with a client
    },
    {
      title: "GROUP FITNESS CLASS",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", // group workout atmosphere
    },
    {
      title: "FUNCTIONAL TRAINING",
      image: "https://images.unsplash.com/photo-1558611848-73f7eb4001ab?auto=format&fit=crop&w=800&q=80", // functional movement training 
    },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="font-bebas text-3xl mb-8 text-center">TRAININGS</h3>
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
