// Polymorphic
public class Hello {
    public static void main(String[] args) {
			 Person ming = new Person("Ming", 18);
			 Person hong = new Person("Hong", 20);
			 ming.number = 88;
			 hong.number = 99;
			 System.out.println(ming.number);
			 System.out.println(hong.number);
    }
}

class Person {
	public String name;
	public int age;

	public static int number;
}