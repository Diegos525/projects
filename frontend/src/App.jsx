import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
const API_URL = "https://bobcat-book-exchange-project.onrender.com";


function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const[search, setSearch] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    course: "",
    price: "",
    condition: "",
    description: "",
  });

  useEffect(() => {
    getBooks();
  }, []);

  function getBooks() {
    axios.get(`${API_URL}/books`)
      .then((response) => {
        setBooks(response.data);
      })
      .catch(() => {
        setMessage("Could not load books");
      });
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleBookChange(e) {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const url = isLogin
      ? `${API_URL}/login`
      : `${API_URL}/signup`;    

    axios.post(url, form)
      .then((response) => {
        setMessage(response.data.message);

        if (isLogin) {
          setUser(response.data.user);
          setMessage("");
        }
      })
      .catch((error) => {
        setMessage(error.response?.data?.error || "An error occurred");
      });
  }

  function addBook(e) {
    e.preventDefault();

    axios.post(`${API_URL}/books`, {
      ...bookForm,
      seller_id: user.id,
    })
      .then((response) => {
        setMessage(response.data.message);
        setBookForm({
          title: "",
          author: "",
          course: "",
          price: "",
          condition: "",
          description: "",
        });
        getBooks();
      })
      .catch(() => {
        setMessage("Could not add book");
      });
  }

  function deleteBook(id) {
  axios.delete(`${API_URL}/books/${id}`)
    .then(() => {
      getBooks();
    })
    .catch(() => {
      setMessage("Could not delete book");
    });
}

function markSold(id) {
  axios.put(`${API_URL}/books/${id}/sold`)
    .then((response) => {
      setMessage(response.data.message);
      getBooks();
    })
    .catch((error) => {
      console.log("Status:", error.response?.status);
      console.log("Backend error:", error.response?.data);
      setMessage(error.response?.data?.error || "Could not mark as sold");
    });
}

function contactSeller(bookId, bookTitle) {
  axios.get(`${API_URL}/books/${bookId}/contact`, {
    params: { requester_id: user.id },
  })
    .then((response) => {
      const { seller_email } = response.data;
      window.location.href = `mailto:${seller_email}?subject=Interested in "${bookTitle}"&body=Hi, I saw your listing for "${bookTitle}" on Bobcat Book Exchange and I'm interested!`;
    })
    .catch((error) => {
      setMessage(error.response?.data?.error || "Could not get seller contact info");
    });
}

  if (!user) {
    return (
      <div>
      
           <h1>Bobcat Book Exchange📚</h1>
   
        
        
        
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />

          {!isLogin && (
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          )}

          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
        </button>

        <p>{message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Bobcat Book Exchange📚</h1>
      <p>Logged in as {user.username}</p>
      <button onClick={() => setUser(null)}>Logout</button>

      <h2>Sell a Book</h2>

      <form onSubmit={addBook}>
        <input name="title" placeholder="Title" value={bookForm.title} onChange={handleBookChange} />
        <input name="author" placeholder="Author" value={bookForm.author} onChange={handleBookChange} />
        <input name="course" placeholder="Course ex: CSE 24" value={bookForm.course} onChange={handleBookChange} />
        <input name="price" placeholder="Price" value={bookForm.price} onChange={handleBookChange} />
        <input name="condition" placeholder="Condition" value={bookForm.condition} onChange={handleBookChange} />
        <input name="description" placeholder="Description" value={bookForm.description} onChange={handleBookChange} />

        <button type="submit">Add Book</button>
      </form>

      

      
      
      <h2>Books for Sale</h2>

      <input
        type="text"
        placeholder="Search by title or course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {books
      .filter((book) =>
        (book.title || "") .toLowerCase().includes(search.toLowerCase()) ||
        (book.course || "").toLowerCase().includes(search.toLowerCase())
      )
      .map((book) => (
        <div className="book-card" key={book.id}>
          <h3>{book.title} 📕</h3>
          <p>Author: {book.author}</p>
          <p>Course: {book.course}</p>
          <p>Price: ${book.price}</p>
          <p>Condition: {book.condition}</p>
          <p>{book.description}</p>
        {user.id === book.seller_id && (
          <button    
          className="delete-button"
          onClick={() => deleteBook(book.id)} >
            Delete 
          </button>
          
          )}
          <p className={book.sold ? "sold" : "available"}>
          Status: {book.sold ? "🔴 Sold" : "🟢 Available"}
          </p>

          {user.id === book.seller_id && !book.sold && (
          <button 
          className="mark-sold-button"
          onClick={() => markSold(book.id)}>
             Mark as Sold
          </button>
          )}
          {user.id !== book.seller_id && !book.sold && (
                  <button className="contact-button" onClick={() => contactSeller(book.id, book.title)}>
                    Contact Seller
                  </button>
                )}
          </div>
      ))}

      <p>{message}</p>
    </div>
  );
}

export default App;