import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography, Button } from '@mui/material';
import getUserRoleFromToken from './hooks/getUserRole';

const cardsData = [
  {
    title: "Projects",
    subtitle: "Assignments",
    color: "#203f52",
    image: "/assets/images/projects.png",
    link: "/projects"
  },
  {
    title: "Salary Reviews",
    subtitle: "Review salary information.",
    color: "#203f52",
    image: "/assets/images/salary_review_list.webp",
    link: "/salaryreviews"
  },
  {
    title: "Salary Reviews to Approve",
    subtitle: "Check salary reviews.",
    color: "#4d137f",
    image: "/assets/images/salary_review_approve.webp", 
    link: "/salaryreviewrequests"
  },
  {
    title: "Admin Panel",
    subtitle: "Administrate portal.",
    color: "#ff9900",
    image: "/assets/images/admin_panel.png", 
    link: "/admin"
  }
];

const Home = () => {
  const userRole = getUserRoleFromToken();

  return (
    <div style={{ marginTop: '40px', padding: '20px' }}>
      <Typography variant="h4" component="h1" textAlign="center" marginBottom="32px">
        Welcome to the DM Portal
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {cardsData.map((card, index) => (
          (card.title !== "Salary Review Approvals" || userRole === 'Head' || userRole === 'DeputyHead' || userRole === 'DivisionManager') && (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ maxWidth: 345, bgcolor: card.color }}>
                <CardActionArea component={Link} to={card.link}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={process.env.PUBLIC_URL + card.image}
                    alt={card.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div" sx={{ color: '#fff' }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {card.subtitle}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        ))}
      </Grid>
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button component={Link} to="/changepassword" variant="outlined">Change Password</Button>
      </div>
    </div>
  );
};

export default Home;
