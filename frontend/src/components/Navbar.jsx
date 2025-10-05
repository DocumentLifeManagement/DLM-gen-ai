const Navbar = () => (
  <nav className="bg-blue-800 px-8 py-4 flex justify-between items-center">
    <span className="text-white text-xl font-semibold">DocuAgent</span>
    <div className="space-x-6">
      <a href="#" className="text-white hover:text-blue-300">
        Home
      </a>
      <a href="#" className="text-white hover:text-blue-300">
        Docs
      </a>
      <a href="#" className="text-white hover:text-blue-300">
        About
      </a>
      <a href="#" className="text-white hover:text-blue-300">
        Contact
      </a>
    </div>
  </nav>
);

export default Navbar;
