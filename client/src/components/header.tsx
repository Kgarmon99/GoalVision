{/* Assuming this code is within a Header component and necessary imports (like Button, Compass, Bell, UserCircle) are available.  Also assuming an image file named "user-profile.jpeg" exists in a "/images" directory within the public folder. */}
<Button variant="ghost" className="ml-auto">
            <Compass className="h-5 w-5 text-green-400" />
          </Button>
          <Button variant="ghost">
            <Bell className="h-5 w-5 text-green-400" />
          </Button>
          <Button variant="ghost" className="relative group">
            <img 
              src="/images/kahlil-profile.jpeg" 
              alt="Kahlil Garmon" 
              className="h-8 w-8 rounded-full border border-green-400 transition-all group-hover:border-green-300 group-hover:shadow-lg group-hover:shadow-green-500/20" 
            />
          </Button>