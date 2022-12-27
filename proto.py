import time
class Color:
    Red = 1
    Blue = 0
    Green = -1

class Button:
    def __init__(self,id) -> None:
        self.__id =id
        self.colr = Color.Blue
        self.__initialised_time = time.clock_gettime_ns(0)
    def __str__(self) -> str:
        return f"Button {self.colr} {self.getColr()}"
    def __repr__(self) -> str:
        return self.__str__()
    def getColr(self):
        if self.colr==Color.Blue:
            tm = time.clock_gettime_ns(0) - self.__initialised_time
            return int(abs(tm)/100)%3 -1
        return self.colr
    def hit(self):
        if self.colr==Color.Blue:
            self.colr = self.getColr()
        return self.colr==Color.Blue
        
def main(buttons,id):
    print(buttons)
    a = int(input())
    if a<0 or a>=len(buttons):
        main(buttons,id)
    else:
        if buttons[a].hit():
            buttons.append(Button(id))
            id +=1
            main(buttons,id)
        else:
            gamend = True
            for b in buttons:
                if b.colr == Color.Blue:
                    gamend = False
                    break
            if gamend:
                print(buttons)
                return 
            else:
                main(buttons,id)


if __name__=='__main__':
    buttons=[]
    for i in range(5):
        buttons.append(Button(i))
    id =5
    main(buttons,id)

