import AddFriends from "../components/AddFriends";
import Header from "../components/Header"
import ReminderForm from "../components/Reminder_form";
import User from "./User"


const Home = ({ userDetails }: any) => {
  return (
    <main>
      <Header />
      <section>
        <User
          userDetails={userDetails}
        />
      </section>
      <AddFriends
        userId={userDetails.userId}
      />
      <ReminderForm />
    </main>
  )
}

export default Home;



