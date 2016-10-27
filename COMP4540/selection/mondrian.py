from PIL import Image,ImageDraw
import random
import copy
import time
import statistics
from operator import attrgetter,itemgetter

class imageGenerator:
    def generate_iteration(self, imageList, filename, imageScore):
        imageList=self.Selection(imageList, imageScore)
        print("imageList size:"+str(len(imageList)));
        self.mutation(imageList)
        self.crossover(imageList)
        self.fixLong(imageList)
        for i in range(27):
            #generating 27 images
            self.Next(imageList[i],filename[i])
        return imageList;

    def sortgene(self,image):
        for gene in image:
            gene.update({'area':((int(gene['endx']) - int(gene['startx']))*(int(gene['endy']) - int(gene['starty'])))})
        image = sorted(image, key=itemgetter('area'))
        for gene in image:
            #print(gene)
            #print(gene['area'])
            gene.pop('area',None)
            #print(gene)
        # print("-----------------")
        #print('hahahahahahahahahaha')

    def saverectangle(self,filename,image):
        red = '#a0262e'
        yellow = '#ecd344'
        blue = '#30509b'
        white = '#e5e5df'
        image1 = Image.new("RGB", (481, 481), (255, 255, 255))
        draw = ImageDraw.Draw(image1)
        draw.rectangle([0, 0, 480, 480], white, outline="black")
        record = []
        for attribute in image:
            if (attribute['color'] == 'red'):
                draw.rectangle([int(attribute['startx']), int(attribute['starty']), int(attribute['endx']),
                                int(attribute['endy'])], red, outline="black")
            if (attribute['color'] == 'yellow'):
                draw.rectangle([int(attribute['startx']), int(attribute['starty']), int(attribute['endx']),
                                int(attribute['endy'])], yellow, outline="black")
            if (attribute['color'] == 'blue'):
                draw.rectangle([int(attribute['startx']), int(attribute['starty']), int(attribute['endx']),
                                int(attribute['endy'])], blue, outline="black")
            if (attribute['color'] == 'white'):
                draw.rectangle([int(attribute['startx']), int(attribute['starty']), int(attribute['endx']),
                                int(attribute['endy'])], white, outline="black")
            record.append([int(attribute['startx']), int(attribute['starty']), int(attribute['endx']),int(attribute['endy'])])
            draw.line(
                (int(attribute['startx']), int(attribute['starty']), int(attribute['endx']), int(attribute['starty'])),
                width=1, fill="black")
            draw.line(
                (int(attribute['startx']), int(attribute['starty']), int(attribute['startx']), int(attribute['endy'])),
                width=1, fill="black")
            draw.line(
                (int(attribute['startx']), int(attribute['endy']), int(attribute['endx']), int(attribute['endy'])),
                width=1, fill="black")
            draw.line(
                (int(attribute['endx']), int(attribute['starty']), int(attribute['endx']), int(attribute['endy'])),
                width=1, fill="black")
        image1.save(filename)
        return record

    def fixangle(self,filename):
        im = Image.open(filename)
        draw = ImageDraw.Draw(im)
        pix = im.load()
        record1 = []
        record2 = []
        for p in range(1, 480):
            for j in range(1, 480):
                if pix[p, j] == (0, 0, 0):
                    # print(p,j)
                    k = 0
                    if (pix[p + 1, j] == (0, 0, 0)) & (pix[p - 1, j] == (0, 0, 0)):
                        # print (1)
                        continue
                    elif (pix[p, j - 1] == (0, 0, 0)) & (pix[p, j + 1] == (0, 0, 0)):
                        # print(2)
                        continue
                    elif (pix[p, j - 1] != (0, 0, 0)) & (pix[p - 1, j] != (0, 0, 0)):
                        # print(3)
                        l = j - 1
                        distance = 0
                        while l >= 0:
                            if pix[p, l] == (0, 0, 0):
                                distance = j - l
                                break
                            l = l - 1
                        k = p - 1
                        while k >= 0:
                            if pix[k, j] == (0, 0, 0):
                                if p - k < distance:
                                    record1.append([k, j, p, j])
                                    break
                                else:
                                    record1.append([p, l, p, j])
                                    break
                            k = k - 1


                    elif (pix[p, j - 1] != (0, 0, 0)) & (pix[p + 1, j] != (0, 0, 0)):
                        # print(4)
                        l = j - 1
                        distance = 0
                        while l >= 0:
                            if pix[p, l] == (0, 0, 0):
                                distance = j - l
                                break
                            l = l - 1
                        k = p + 1
                        while k <= 480:
                            if pix[k, j] == (0, 0, 0):
                                if k - p < distance:
                                    record1.append([p, j, k, j])
                                    break
                                else:
                                    record1.append([p, l, p, j])
                                    break
                            k = k + 1


                    elif (pix[p, j + 1] != (0, 0, 0)) & (pix[p - 1, j] != (0, 0, 0)):
                        # print(5)
                        l = j + 1
                        distance = 0
                        while l <= 480:
                            if pix[p, l] == (0, 0, 0):
                                distance = l - j
                                break
                            l = l + 1
                        k = p - 1
                        while k >= 0:
                            if pix[k, j] == (0, 0, 0):
                                if p - k < distance:
                                    record1.append([k, j, p, j])
                                    break
                                else:
                                    record1.append([p, j, p, l])
                                    break
                            k = k - 1


                    elif (pix[p, j + 1] != (0, 0, 0)) & (pix[p + 1, j] != (0, 0, 0)):
                        # print(6)
                        l = j + 1
                        distance = 0
                        while l <= 480:
                            if pix[p, l] == (0, 0, 0):
                                distance = l - j
                                break
                            l = l + 1
                        k = p + 1
                        while k <= 480:
                            if pix[k, j] == (0, 0, 0):
                                if k - p < distance:
                                    record1.append([p, j, k, j])
                                    break
                                else:
                                    record1.append([p, j, p, l])
                                    break
                            k = k + 1

        for i in range(1,480):
            j = 1
            while j < 480:
                if pix[i,j] == (0,0,0):
                    #print (j)
                    if pix[i,j+1] == (0,0,0):
                        k = j
                        while pix[i,k] == (0,0,0):
                            k = k + 1
                            if k == 480:
                                break
                        record2.append([i,j,i,k])
                        j = k
                j = j + 1

        for i in range(1,480):
            j = 1
            while j < 480:
                if pix[j,i] == (0,0,0):
                    if pix[j+1,i] == (0,0,0):
                        k = j
                        while pix[k,i] == (0,0,0):
                            k = k + 1
                            if k == 480:
                                break
                        record2.append([k,i,j,i])
                        j = k
                j = j + 1

        for line in record2:
            draw.line((line[0], line[1], line[2], line[3]), width=3, fill='black')
        for line in record1:
            draw.line((line[0], line[1], line[2], line[3]), width=3, fill='black')

        w, h = im.size
        im.crop((4, 4, w - 4, h - 4)).save(filename)

    def fixoverlapline(self,filename):
        im = Image.open(filename)
        draw = ImageDraw.Draw(im)
        pix = im.load()
        record1 = []
        record2 = []
        record3 = []
        record4 = []
        for p in range(1, 480):
            for j in range(1, 480):
                if pix[p, j] == (0, 0, 0):
                    if pix[p, j+1] == (0,0,0):
                        k = max(0,p-4)
                        while k < min(480,p+4) & k != p:
                            if pix[k,j] != (0,0,0):
                                k = k + 1
                            else:
                                flag = j
                                while ((pix[k,flag] == (0,0,0)) & (pix[k-1,flag] != (0,0,0)) & (pix[k+1,flag] != (0,0,0)))   \
                                        | ((pix[k,flag] == (0,0,0)) & (pix[k-1,flag] == (0,0,0)) & (pix[k+1,flag] != (0,0,0))) \
                                        | ((pix[k,flag] == (0,0,0)) & (pix[k-1,flag] != (0,0,0)) & (pix[k+1,flag] == (0,0,0))):
                                    flag = flag + 1
                                    if (pix[k,flag] == (0,0,0)) & (pix[k-1,flag] == (0,0,0)) & (pix[k+1,flag] != (0,0,0)):
                                        record1.append([k,flag])
                                    if (pix[k, flag] == (0, 0, 0)) & (pix[k - 1, flag] != (0, 0, 0)) & (pix[k + 1, flag] == (0, 0, 0)):
                                        record2.append([k, flag])
                                length1 = flag - j
                                flag = j
                                while ((pix[p,flag] == (0,0,0)) & (pix[p-1,flag] != (0,0,0)) & (pix[p+1,flag] != (0,0,0))) \
                                        | ((pix[p,flag] == (0,0,0)) & (pix[p-1,flag] == (0,0,0)) & (pix[p+1,flag] != (0,0,0)))\
                                        | ((pix[p,flag] == (0,0,0)) & (pix[p-1,flag] != (0,0,0)) & (pix[p+1,flag] == (0,0,0))):
                                    flag = flag + 1
                                    if (pix[p,flag] == (0,0,0)) & (pix[p-1,flag] == (0,0,0)) & (pix[p+1,flag] != (0,0,0)):
                                        record3.append([p,flag])
                                    if (pix[p,flag] == (0,0,0)) & (pix[p-1,flag] != (0,0,0)) & (pix[p+1,flag] == (0,0,0)):
                                        record4.append([p,flag])
                                length2 = flag - j

                                if(length2 > length1):
                                    print(1)


        print(1)

    def deleteline(self,filename,delete_line):
        def color(a):
            if a == (137, 43, 49):
                return '#a0262e'
            if a == (62, 81, 152):
                return '#ecd344'
            if a == (228, 210, 82):
                return '#30509b'
            if a == (228, 228, 222):
                return '#e5e5df'

        Is_Simplest = True
        while Is_Simplest == True:
            im = Image.open(filename)
            draw = ImageDraw.Draw(im)
            pix = im.load()
            for p in range(1, 480):
                j = 1
                while j < 480:
                    FFF = 1
                    # print(j)
                    if pix[p, j] == (0, 0, 0):
                        # print(1)
                        if pix[p, j + 1] == (0, 0, 0):
                            FFF = 0
                            print(2384918391283192381293)
                            k = j
                            flag = 0
                            while pix[p, k] == (0, 0, 0):
                                if k == 480:
                                    break
                                elif pix[p - 1, k] != pix[p + 1, k]:
                                    flag = 1
                                k = k + 1

                            if flag == 1:
                                j = k

                            if flag == 0:
                                Is_Simplest = False
                                #draw.line((p, j, p, k), color(pix[p + 1, k - 1]))
                                delete_line.append([[p, j, p, k], color(pix[p + 1, k - 1])])
                                j = k
                    j = j + FFF
            for j in range(1, 480):
                p = 1
                while p < 480:
                    fff = 1
                    if pix[p, j] == (0, 0, 0):
                        if pix[p + 1, j] == (0, 0, 0):
                            fff = 0
                            k = p
                            flag = 0
                            while pix[k, j] == (0, 0, 0):
                                if k == 480:
                                    break
                                elif pix[k, j + 1] != pix[k, j - 1]:
                                    flag = 1
                                k = k + 1
                            if flag == 1:
                                p = k

                            if flag == 0:
                                Is_Simplest = False
                                #draw.line((p, j, k, j), color(pix[k - 1, j + 1]))
                                delete_line.append([[p, j, k, j],color(pix[k - 1, j + 1])])
                                p = k
                    p = p + fff
            for line in delete_line:
                draw.line([line[0], line[1], line[2], line[3]], color)

            im.save(filename)
            if Is_Simplest == True:
                break

    def drawimage(self,filename,record):
        red = '#a0262e'
        yellow = '#ecd344'
        blue = '#30509b'
        white = '#e5e5df'
        for attribute in self.imageList[self.i]:
            if (attribute['color'] == 'red'):
                self.imageArea.create_rectangle(attribute['startx'], attribute['starty'], attribute['endx'],
                                                attribute['endy'], fill=red, width=4)
            if (attribute['color'] == 'yellow'):
                self.imageArea.create_rectangle(attribute['startx'], attribute['starty'], attribute['endx'],
                                                attribute['endy'], fill=yellow, width=4)
            if (attribute['color'] == 'blue'):
                self.imageArea.create_rectangle(attribute['startx'], attribute['starty'], attribute['endx'],
                                                attribute['endy'], fill=blue, width=4)
            if (attribute['color'] == 'white'):
                self.imageArea.create_rectangle(attribute['startx'], attribute['starty'], attribute['endx'],
                                                attribute['endy'], fill=white, width=4)

        for line in record:
            self.imageArea.create_line(line[0], line[1], line[2], line[3], width=4)


        self.imageArea.update()
        self.imageArea.postscript(file = "Image.ps",colormode = 'color')
        im = Image.open('Image.ps')
        w,h = im.size
        im.crop((4,4,w-4,h-4)).save(filename)

    def fixLong(self,imageList):
        print("enter genotype to phenotype")
        red = '#a0262e'
        yellow = '#ecd344'
        blue = '#30509b'
        white = '#e5e5df'
        buffer = []
        hori = []
        vert = []
        for imagen in imageList:
            # if long rectangle exists
            for i in range(len(imagen)):
                if int(imagen[i]['startx']) == 0 & int(imagen[i]['endx']) == 480:
                    hori.append(imagen[i])
                    del imagen[i]
                if int(imagen[i]['starty']) == 0 & int(imagen[i]['endy']) == 480:
                    vert.append(imagen[i])
                    del imagen[i]
            # if exist and more than 1
            if len(hori) > 1:
                for rectangle1, rectangle2 in hori:
                    flag = [1]
                    while (len(flag) >= 1):
                        # check overlapping
                        if (rectangle1["starty"] == 0 & rectangle2["starty"] != 0):
                            flag.append(1)
                            if (int(rectangle2["starty"]) < int(rectangle1["endy"])):
                                rectangle2["endy"] = int(rectangle2["endy"]) - int(rectangle2["starty"]) + int(
                                    rectangle1["endy"])
                                rectangle2["starty"] = rectangle1["endy"]

                        if (rectangle1["endy"] == 480 & rectangle2["endy"] != 480):
                            flag.append(1)
                            if (int(rectangle2["endy"]) > int(rectangle1["starty"])):
                                rectangle2["starty"] = int(rectangle2["endy"]) - int(rectangle2["starty"]) + 480 - int(
                                    rectangle1["starty"])
                                rectangle2["endy"] = rectangle1["starty"]
                        del flag[-1]

            if len(vert) > 1:
                for rectangle1, rectangle2 in vert:
                    flag = [1]
                    while len(flag) == 1:
                        # check overlapping
                        if (rectangle1["startx"] == 0 & rectangle2["startx"] != 0):
                            flag.append(1)
                            if (int(rectangle2["startx"]) < int(rectangle1["endx"])):
                                rectangle2["endx"] = int(rectangle2["endx"]) - int(rectangle2["startx"]) + int(
                                    rectangle1["endx"])
                                rectangle2["startx"] = rectangle1["endx"]

                        if (rectangle1["endx"] == 480 & rectangle2["endx"] != 480):
                            flag.append(1)
                            if (int(rectangle2["endx"]) > int(rectangle1["startx"])):
                                rectangle2["startx"] = int(rectangle2["endx"]) - int(rectangle2["startx"]) + 480 - int(
                                    rectangle1["startx"])
                                rectangle2["endx"] = rectangle1["startx"]
                        del flag[-1]
            # if horizontal and vertical overlapped
            # if(len(hori) > 0 & len(vert) > 0):
            #    rand
            for item in vert:
                buffer.append(item)
            for item in hori:
                buffer.append(item)
            while len(hori) != 0:
                del hori[-1]
            while len(vert) != 0:
                del vert[-1]

            # all genes occupy either the whole x axis or y axis
            if len(imagen) - len(buffer) == 0:
                continue
            # one more gene
            if len(imagen) - len(buffer) == 1:
                for gene in imagen:
                    if not ((gene["startx"] == 0 & gene["endx"] == 480) | (gene["startx"] == 0 & gene["endx"] == 480)):
                        # find the boundary
                        for item in buffer:
                            endy = []
                            endx = []
                            endy.append(item["endy"])
                            endx.append(item["endx"])
                        ey = max(endy)
                        ex = max(endx)
        print(len(imageList))

    def crossover(self,imageList):
        print("enter crossover")
        random.seed(int(time.time()));
        for image in imageList:
            random.shuffle(image)
        cross = [i for i in range(27)]
        random.shuffle(cross)
        #for item in self.imageList:
        #    print (len(item))

        #print("alkfjhaskldjalksdj")
        #print(cross)
        i = 0
        buffer = []
        while i < len(imageList) - 1:
            # print("aaa")
            #print(len(self.imageList[cross[i]]), len(self.imageList[cross[i + 1]]))
            length = min(len(imageList[cross[i]]), len(imageList[cross[i + 1]]))
            cut = random.randint(1, length)
            #print(length,cut)
            #print("-----")
            flag = cut
            while flag < len(imageList[cross[i]]):
                #print (flag)
                buffer.append(imageList[cross[i]][flag])
                flag = flag + 1

            #print ("-----")
            flag = len(imageList[cross[i]]) - 1
            while flag >= cut:
                #print(flag)
                del imageList[cross[i]][flag]
                flag = flag - 1
            #print(len(self.imageList[cross[i]]))
            #print("------")
            flag = flag + 1
            while flag < len(imageList[cross[i + 1]]):
                #print (flag)
                imageList[cross[i]].append(imageList[cross[i + 1]][flag])
                flag = flag + 1
            #print("------")
            #print(len(self.imageList[cross[i]]))
            #print("------")
            flag = len(imageList[cross[i + 1]]) - 1
            while flag >= cut:
                #print(flag)
                del imageList[cross[i + 1]][flag]
                flag = flag - 1
            #print("------")
            #print(len(self.imageList[cross[i+1]]))
            #print(len(buffer))
            for item in buffer:
                imageList[cross[i + 1]].append(item)
                # imageList[cross[i]][cut:cut+2] = imageList[cross[i+1]][cut:cut+2]
                # imageList[cross[i+1]][cut:cut+2] = buffer
            while len(buffer) != 0:
               del buffer[-1]

            #print(len(buffer))
            #print(len(self.imageList[cross[i]]),len(self.imageList[cross[i+1]]))
            #print("---------------")
            i = i + 2

    def mutation(self,imageList):
        print('enter mutation')
        mutationRate = 1
        random.seed(int(time.time()));
        for i in range(len(imageList)):
            if (random.random() < mutationRate):
                cut = random.randint(0, len(imageList[i]) - 1)
                mut = random.randint(0, 18)
                if(int(imageList[i][cut]["startx"])!= 480 & int(imageList[i][cut]["starty"]) != 480
                    & int(imageList[i][cut]["endx"]) != 0 & int(imageList[i][cut]["endy"]) != 0):
                    if (mut == 0):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                    if (mut == 1):
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                    if (mut == 2):
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                    if (mut == 3):
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)

                    if (mut == 4):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                    if (mut == 5):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                    if (mut == 6):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)
                    if (mut == 7):
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                    if (mut == 8):
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                    if (mut == 9):
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)

                    if (mut == 10):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)

                    if (mut == 11):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)

                    if (mut == 12):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)

                    if (mut == 13):
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)

                    if (mut == 14):
                        imageList[i][cut]["startx"] = random.randint(0, int(imageList[i][cut]["endx"]) - 1)
                        imageList[i][cut]["starty"] = random.randint(0, int(imageList[i][cut]["endy"]) - 1)
                        imageList[i][cut]["endy"] = random.randint(int(imageList[i][cut]["starty"]) + 1, 480)
                        imageList[i][cut]["endx"] = random.randint(int(imageList[i][cut]["startx"]) + 1, 480)

                    if (mut == 15 or mut == 16 or mut == 17 or mut == 18):
                        colorList = ['red', 'blue', 'yellow', 'white']
                        mutcolor = imageList[i][cut]["color"]
                        while mutcolor == imageList[i][cut]["color"]:
                            mutcolor = random.choice(colorList)
                        imageList[i][cut]["color"] = mutcolor

    def Selection(self,imageList,imageScore):
        print("enter selection")
        random.seed(int(time.time()));
        shareValue = []
        randomNumber = []
        newImage = []
        totalvalue = sum(imageScore)
        for i in range(len(imageScore)):
            shareValue.append(imageScore[i] / totalvalue)
        cumShareValue = copy.deepcopy(shareValue)

        for i in range(len(shareValue)):
            t = 0
            # print(shareValue)
            for j in range(i):
                t = shareValue[j] + t
            cumShareValue[i] = t
        del cumShareValue[0]
        cumShareValue.append(1)
        # print(cumShareValue)
        for i in range(len(imageList)):
            randomNumber.append(random.random())
        randomNumber.sort()
        print(randomNumber)
        i = 0
        j = 0
        while j < len(imageList):
            if (randomNumber[j] < cumShareValue[i]):
                newImage.append(imageList[i])
                print(i)
                j = j + 1
                i = 0
            else:
                i = i + 1

        return newImage

    def Next(self,image,filename):
        white = '#e5e5df'
        self.sortgene(image)
        record = self.saverectangle(filename,image)
        self.fixangle(filename)
        #self.fixoverlapline(filename[self.i])
        #self.deleteline(filename[self.i],delete)
        #self.drawimage(filename,record)
