// ...existing code...

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' })); // Increased limit significantly
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// ...existing code...