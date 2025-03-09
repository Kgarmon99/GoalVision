import React from "react";

// Created ProfileImage component
const ProfileImage = ({ size }) => {
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-16 w-16"; // Adjust sizes as needed
  return (
    <img
      src="/attached_assets/IMG_0152.jpeg" // Assumes image is in public folder
      alt="Profile"
      className={`${sizeClass} rounded-full`}
    />
  );
};


// Example component integration (Assuming this is a part of your app's structure)
const MotivationalElement = () => {
  return (
    <div>
      {/* ... other content ... */}
      <Card>
        <CardContent>
          {/* ... Card content ... */}
          <div className="flex justify-end p-4">
            <ProfileImage size="sm" />
          </div>
        </CardContent>
      </Card>
      {/* ... rest of the component ... */}
    </div>
  );
};

export { ProfileImage, MotivationalElement };

//Another example (assuming this is another component in your application)
const AnotherComponent = () => {
    return (
        <div>
            <ProfileImage size="lg"/>
            {/*Rest of the component */}
        </div>
    )
}

export {AnotherComponent}

//Remember to move IMG_0152.jpeg to the public folder if it's not already there.